'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { runPingTest } from './pingService';
import { calculateMbps, type PingStats } from './speedCalculator';
import { saveResult, getHistory, type TestResult } from './testHistory';

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

export interface SpeedTestState {
  phase: TestPhase;
  currentSpeed: number;
  pingStats: PingStats | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
  progress: number;
  error: string | null;
  isRunning: boolean;
  currentPing: number | null;
  history: TestResult[];
}

const DOWNLOAD_DURATION = 10_000;
const UPLOAD_DURATION = 10_000;
const UPLOAD_CHUNK_SIZE = 262144;
const UPLOAD_MAX_BYTES = 52_428_800;
const SPEED_UPDATE_INTERVAL = 300;

function createInitialState(): SpeedTestState {
  return {
    phase: 'idle',
    currentSpeed: 0,
    pingStats: null,
    downloadMbps: null,
    uploadMbps: null,
    progress: 0,
    error: null,
    isRunning: false,
    currentPing: null,
    history: [],
  };
}

export function useSpeedTest() {
  const [state, setState] = useState<SpeedTestState>(createInitialState);
  const abortRef = useRef<AbortController | null>(null);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    setState((prev) => ({ ...prev, history: getHistory() }));
  }, []);

  const clearIntervals = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);

  const runDownloadTest = useCallback(
    async (signal: AbortSignal): Promise<number> => {
      const response = await fetch('/api/download', {
        cache: 'no-store',
        signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Download test failed');
      }

      const reader = response.body.getReader();
      let totalBytes = 0;
      const startTime = performance.now();

      const updateInterval = setInterval(() => {
        if (signal.aborted) return;
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed <= 0) return;
        const mbps = calculateMbps(totalBytes, elapsed);
        const progress = Math.min(
          ((performance.now() - startTime) / DOWNLOAD_DURATION) * 100,
          100
        );
        setState((prev) => ({
          ...prev,
          currentSpeed: mbps,
          progress,
        }));
      }, SPEED_UPDATE_INTERVAL);
      intervalsRef.current.push(updateInterval);

      try {
        while (true) {
          if (signal.aborted) break;
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.byteLength;
          }
        }
      } catch {
        if (!signal.aborted) throw new Error('Download interrupted');
      } finally {
        clearInterval(updateInterval);
        try { reader.cancel(); } catch {}
      }

      const elapsed = (performance.now() - startTime) / 1000;
      return calculateMbps(totalBytes, elapsed);
    },
    []
  );

  const runUploadTest = useCallback(
    async (signal: AbortSignal): Promise<number> => {
      let totalBytesSent = 0;
      const startTime = performance.now();
      const chunk = new Uint8Array(UPLOAD_CHUNK_SIZE);

      const updateInterval = setInterval(() => {
        if (signal.aborted) return;
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed <= 0) return;
        const mbps = calculateMbps(totalBytesSent, elapsed);
        const progress = Math.min(
          ((performance.now() - startTime) / UPLOAD_DURATION) * 100,
          100
        );
        setState((prev) => ({
          ...prev,
          currentSpeed: mbps,
          progress,
        }));
      }, SPEED_UPDATE_INTERVAL);
      intervalsRef.current.push(updateInterval);

      try {
        while (
          performance.now() - startTime < UPLOAD_DURATION &&
          totalBytesSent < UPLOAD_MAX_BYTES
        ) {
          if (signal.aborted) break;

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: chunk,
            headers: { 'Content-Type': 'application/octet-stream' },
            cache: 'no-store',
            signal,
          });

          if (response.status === 413) {
            break;
          }

          if (response.ok) {
            const data = await response.json();
            totalBytesSent += data.bytesReceived || UPLOAD_CHUNK_SIZE;
          } else {
            totalBytesSent += UPLOAD_CHUNK_SIZE;
          }
        }
      } catch {
        if (!signal.aborted) {
          // Upload error, use whatever data we have
        }
      } finally {
        clearInterval(updateInterval);
      }

      const elapsed = (performance.now() - startTime) / 1000;
      return calculateMbps(totalBytesSent, elapsed);
    },
    []
  );

  const startTest = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setState({
      ...createInitialState(),
      phase: 'ping',
      isRunning: true,
      progress: 0,
      history: getHistory(),
    });

    try {
      const pingStats = await runPingTest((ping, index) => {
        if (signal.aborted) return;
        setState((prev) => ({
          ...prev,
          currentPing: ping >= 0 ? ping : null,
          progress: ((index + 1) / 10) * 100,
        }));
      }, signal);

      if (signal.aborted) return;

      setState((prev) => ({
        ...prev,
        pingStats,
        phase: 'download',
        currentSpeed: 0,
        progress: 0,
      }));

      const downloadMbps = await runDownloadTest(signal);

      if (signal.aborted) return;

      setState((prev) => ({
        ...prev,
        downloadMbps,
        phase: 'upload',
        currentSpeed: 0,
        progress: 0,
      }));

      const uploadMbps = await runUploadTest(signal);

      if (signal.aborted) return;

      const result: TestResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        pingAvg: pingStats.avg,
        pingMin: pingStats.min,
        pingMax: pingStats.max,
        jitter: pingStats.jitter,
        downloadMbps,
        uploadMbps,
      };

      saveResult(result);

      setState((prev) => ({
        ...prev,
        uploadMbps,
        currentSpeed: 0,
        phase: 'complete',
        isRunning: false,
        progress: 100,
        history: getHistory(),
      }));
    } catch (err) {
      if (signal.aborted) return;
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Test failed',
        isRunning: false,
        phase: prev.downloadMbps !== null ? prev.phase : 'idle',
      }));
    }
  }, [runDownloadTest, runUploadTest]);

  const resetTest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    clearIntervals();
    setState({ ...createInitialState(), history: getHistory() });
  }, [clearIntervals]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      clearIntervals();
    };
  }, [clearIntervals]);

  return { ...state, startTest, resetTest };
}
