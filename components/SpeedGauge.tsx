'use client';

import { useMemo } from 'react';
import type { TestPhase } from '@/lib/useSpeedTest';
import { formatSpeed, formatPing } from '@/lib/speedCalculator';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed: number;
  phase: TestPhase;
  isRunning: boolean;
  currentPing: number | null;
}

const RADIUS = 120;
const STROKE_WIDTH = 12;
const CENTER = 140;
const START_ANGLE = 135;
const END_ANGLE = 405;
const ARC_RANGE = END_ANGLE - START_ANGLE;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function SpeedGauge({
  speed,
  maxSpeed,
  phase,
  isRunning,
  currentPing,
}: SpeedGaugeProps) {
  const ratio = Math.min(speed / maxSpeed, 1);
  const activeAngle = START_ANGLE + ARC_RANGE * ratio;

  const bgArcPath = useMemo(
    () => describeArc(CENTER, CENTER, RADIUS, START_ANGLE, END_ANGLE),
    []
  );

  const activeArcPath = useMemo(
    () =>
      ratio > 0.001
        ? describeArc(CENTER, CENTER, RADIUS, START_ANGLE, activeAngle)
        : '',
    [ratio, activeAngle]
  );

  const displayValue = phase === 'ping' && currentPing !== null
    ? formatPing(currentPing)
    : formatSpeed(speed);

  const unit = phase === 'ping' ? 'ms' : 'Mbps';

  const phaseLabel = {
    idle: 'READY',
    ping: 'PING',
    download: 'DOWNLOAD',
    upload: 'UPLOAD',
    complete: 'COMPLETE',
  }[phase];

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={bgArcPath}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />

        {activeArcPath && (
          <path
            d={activeArcPath}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            filter={isRunning ? 'url(#glow)' : undefined}
            className="gauge-transition"
          />
        )}

        <text
          x={CENTER}
          y={CENTER - 12}
          textAnchor="middle"
          className="fill-white text-[48px] font-bold"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {phase === 'idle' ? '0' : displayValue}
        </text>

        <text
          x={CENTER}
          y={CENTER + 18}
          textAnchor="middle"
          className="fill-slate-400 text-[16px] font-medium"
        >
          {unit}
        </text>

        <text
          x={CENTER}
          y={CENTER + 48}
          textAnchor="middle"
          className={`text-[12px] font-semibold tracking-widest ${
            phase === 'complete' ? 'fill-[#10b981]' : 'fill-[#3b82f6]'
          }`}
        >
          {phaseLabel}
        </text>
      </svg>

      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full animate-pulse-glow"
            style={{
              width: 260,
              height: 260,
              border: '1px solid rgba(34, 211, 238, 0.15)',
            }}
          />
        </div>
      )}
    </div>
  );
}
