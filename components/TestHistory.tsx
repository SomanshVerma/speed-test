'use client';

import { ArrowDown, ArrowUp, Zap, Trash2 } from 'lucide-react';
import type { TestResult } from '@/lib/testHistory';
import { clearHistory } from '@/lib/testHistory';

interface TestHistoryProps {
  history: TestResult[];
  onClear: () => void;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${hours}:${mins}`;
}

export default function TestHistory({ history, onClear }: TestHistoryProps) {
  if (history.length === 0) return null;

  const handleClear = () => {
    clearHistory();
    onClear();
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Recent Tests
        </h3>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-slate-600 transition-colors hover:text-slate-400"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>
      <div className="space-y-2">
        {history.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-900/40 px-4 py-3"
          >
            <span className="text-xs text-slate-500">
              {formatDate(result.timestamp)}
            </span>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <ArrowDown className="h-3 w-3 text-speed-blue" />
                <span className="text-xs font-medium text-slate-300">
                  {result.downloadMbps.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUp className="h-3 w-3 text-speed-cyan" />
                <span className="text-xs font-medium text-slate-300">
                  {result.uploadMbps.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-speed-green" />
                <span className="text-xs font-medium text-slate-300">
                  {result.pingAvg.toFixed(0)} ms
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
