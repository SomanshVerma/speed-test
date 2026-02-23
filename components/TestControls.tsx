'use client';

import { useState } from 'react';
import { Play, RotateCcw, Copy, Check, Loader2 } from 'lucide-react';
import type { TestPhase } from '@/lib/useSpeedTest';
import type { PingStats } from '@/lib/speedCalculator';
import { formatResultForClipboard, type TestResult } from '@/lib/testHistory';

interface TestControlsProps {
  phase: TestPhase;
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
  pingStats: PingStats | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
}

export default function TestControls({
  phase,
  isRunning,
  onStart,
  onReset,
  pingStats,
  downloadMbps,
  uploadMbps,
}: TestControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!pingStats || downloadMbps === null || uploadMbps === null) return;

    const result: TestResult = {
      id: '',
      timestamp: Date.now(),
      pingAvg: pingStats.avg,
      pingMin: pingStats.min,
      pingMax: pingStats.max,
      jitter: pingStats.jitter,
      downloadMbps,
      uploadMbps,
    };

    try {
      await navigator.clipboard.writeText(formatResultForClipboard(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied
    }
  };

  if (phase === 'idle') {
    return (
      <button
        onClick={onStart}
        className="group flex items-center gap-2.5 rounded-full bg-speed-blue px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-lg hover:shadow-speed-blue/25 active:scale-[0.98]"
      >
        <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
        Start Test
      </button>
    );
  }

  if (isRunning) {
    return (
      <button
        disabled
        className="flex items-center gap-2.5 rounded-full bg-slate-700/50 px-8 py-3.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Testing...
      </button>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            onReset();
            setTimeout(onStart, 50);
          }}
          className="group flex items-center gap-2 rounded-full bg-speed-blue px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-lg hover:shadow-speed-blue/25 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
          Retest
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:text-white active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-speed-green" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
}
