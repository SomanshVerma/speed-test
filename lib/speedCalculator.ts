export function calculateMbps(bytes: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return (bytes * 8) / seconds / 1_000_000;
}

export function calculateJitter(pings: number[]): number {
  if (pings.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < pings.length; i++) {
    sum += Math.abs(pings[i] - pings[i - 1]);
  }
  return sum / (pings.length - 1);
}

export interface PingStats {
  avg: number;
  min: number;
  max: number;
  jitter: number;
  pings: number[];
}

export function calculatePingStats(pings: number[]): PingStats {
  if (pings.length === 0) {
    return { avg: 0, min: 0, max: 0, jitter: 0, pings: [] };
  }
  const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
  const min = Math.min(...pings);
  const max = Math.max(...pings);
  const jitter = calculateJitter(pings);
  return { avg, min, max, jitter, pings };
}

export function formatSpeed(mbps: number): string {
  if (mbps >= 100) return mbps.toFixed(0);
  if (mbps >= 10) return mbps.toFixed(1);
  return mbps.toFixed(2);
}

export function formatPing(ms: number): string {
  if (ms >= 100) return ms.toFixed(0);
  return ms.toFixed(1);
}
