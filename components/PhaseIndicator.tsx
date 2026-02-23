'use client';

import { Zap, ArrowDown, ArrowUp, Check } from 'lucide-react';
import type { TestPhase } from '@/lib/useSpeedTest';

interface PhaseIndicatorProps {
  phase: TestPhase;
  progress: number;
}

const PHASES: {
  key: TestPhase;
  label: string;
  icon: typeof Zap;
}[] = [
  { key: 'ping', label: 'Ping', icon: Zap },
  { key: 'download', label: 'Download', icon: ArrowDown },
  { key: 'upload', label: 'Upload', icon: ArrowUp },
];

const PHASE_ORDER: TestPhase[] = ['ping', 'download', 'upload'];

function getPhaseState(
  itemPhase: TestPhase,
  currentPhase: TestPhase
): 'done' | 'active' | 'pending' {
  if (currentPhase === 'complete') return 'done';
  if (currentPhase === 'idle') return 'pending';
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const itemIdx = PHASE_ORDER.indexOf(itemPhase);
  if (itemIdx < currentIdx) return 'done';
  if (itemIdx === currentIdx) return 'active';
  return 'pending';
}

export default function PhaseIndicator({ phase, progress }: PhaseIndicatorProps) {
  if (phase === 'idle') return null;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {PHASES.map((item, idx) => {
        const state = getPhaseState(item.key, phase);
        const Icon = item.icon;

        return (
          <div key={item.key} className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  state === 'done'
                    ? 'bg-speed-green/20 text-speed-green'
                    : state === 'active'
                    ? 'bg-speed-blue/20 text-speed-blue'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {state === 'done' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  state === 'done'
                    ? 'text-speed-green'
                    : state === 'active'
                    ? 'text-white'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </div>

            {idx < PHASES.length - 1 && (
              <div className="hidden sm:block h-px w-8 bg-slate-700" />
            )}
          </div>
        );
      })}
    </div>
  );
}
