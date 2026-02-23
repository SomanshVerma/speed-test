'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Wifi, Zap, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useSpeedTest } from '@/lib/useSpeedTest';
import { formatSpeed, formatPing } from '@/lib/speedCalculator';
import SpeedGauge from '@/components/SpeedGauge';
import StatCard from '@/components/StatCard';
import PhaseIndicator from '@/components/PhaseIndicator';
import TestControls from '@/components/TestControls';
import TestHistory from '@/components/TestHistory';

export default function Home() {
  const {
    phase,
    currentSpeed,
    pingStats,
    downloadMbps,
    uploadMbps,
    progress,
    error,
    isRunning,
    currentPing,
    history,
    startTest,
    resetTest,
  } = useSpeedTest();

  const handleClearHistory = useCallback(() => {
    resetTest();
  }, [resetTest]);

  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      toast.error(error);
    }
    if (!error) {
      lastErrorRef.current = null;
    }
  }, [error]);

  const gaugeSpeed =
    phase === 'download' || phase === 'upload'
      ? currentSpeed
      : phase === 'complete'
      ? downloadMbps ?? 0
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 py-12 sm:py-16">
        <header className="mb-12 text-center sm:mb-16">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <Wifi className="h-6 w-6 text-speed-blue" />
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              SpeedCheck
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Test your internet connection speed
          </p>
        </header>

        <div className="mb-8">
          <SpeedGauge
            speed={gaugeSpeed}
            maxSpeed={500}
            phase={phase}
            isRunning={isRunning}
            currentPing={currentPing}
          />
        </div>

        <div className="mb-10">
          <PhaseIndicator phase={phase} progress={progress} />
        </div>

        <div className="mb-10 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Zap}
            label="Ping"
            value={pingStats ? formatPing(pingStats.avg) : '--'}
            unit="ms"
            highlight={phase === 'ping'}
          />
          <StatCard
            icon={ArrowDown}
            label="Download"
            value={
              downloadMbps !== null
                ? formatSpeed(downloadMbps)
                : phase === 'download'
                ? formatSpeed(currentSpeed)
                : '--'
            }
            unit="Mbps"
            highlight={phase === 'download'}
          />
          <StatCard
            icon={ArrowUp}
            label="Upload"
            value={
              uploadMbps !== null
                ? formatSpeed(uploadMbps)
                : phase === 'upload'
                ? formatSpeed(currentSpeed)
                : '--'
            }
            unit="Mbps"
            highlight={phase === 'upload'}
          />
          <StatCard
            icon={Activity}
            label="Jitter"
            value={pingStats ? formatPing(pingStats.jitter) : '--'}
            unit="ms"
            highlight={phase === 'ping'}
          />
        </div>

        <div className="mb-16">
          <TestControls
            phase={phase}
            isRunning={isRunning}
            onStart={startTest}
            onReset={resetTest}
            pingStats={pingStats}
            downloadMbps={downloadMbps}
            uploadMbps={uploadMbps}
          />
        </div>

        <TestHistory history={history} onClear={handleClearHistory} />

        <footer className="mt-auto pt-12 text-center">
          <p className="text-xs text-slate-700">
            SpeedCheck &mdash; Browser-based speed test
          </p>
        </footer>
      </div>
    </div>
  );
}
