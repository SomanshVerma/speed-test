'use client';

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  secondary?: { label: string; value: string };
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  highlight = false,
  secondary,
}: StatCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-5 backdrop-blur-sm transition-all duration-300 ${
        highlight
          ? 'border-speed-blue/40 bg-slate-800/60 shadow-lg shadow-speed-blue/5'
          : 'border-slate-700/40 bg-slate-800/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon
          className={`h-4 w-4 ${
            highlight ? 'text-speed-cyan' : 'text-slate-500'
          }`}
        />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-2xl font-bold text-white transition-all duration-300"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      {secondary && (
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xs text-slate-500">{secondary.label}:</span>
          <span className="text-xs text-slate-400">{secondary.value}</span>
        </div>
      )}
    </div>
  );
}
