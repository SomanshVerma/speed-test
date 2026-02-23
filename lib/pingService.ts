import { calculatePingStats, type PingStats } from './speedCalculator';

export async function runPingTest(
  onProgress: (ping: number, index: number) => void,
  signal?: AbortSignal
): Promise<PingStats> {
  const pings: number[] = [];
  const totalPings = 10;

  for (let i = 0; i < totalPings; i++) {
    if (signal?.aborted) break;

    const start = performance.now();
    try {
      await fetch('/api/ping?t=' + Date.now(), {
        cache: 'no-store',
        signal,
      });
      const elapsed = performance.now() - start;
      pings.push(elapsed);
      onProgress(elapsed, i);
    } catch {
      if (signal?.aborted) break;
      pings.push(-1);
      onProgress(-1, i);
    }
  }

  const validPings = pings.filter((p) => p >= 0);
  return calculatePingStats(validPings);
}
