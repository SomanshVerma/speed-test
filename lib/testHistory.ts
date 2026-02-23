export interface TestResult {
  id: string;
  timestamp: number;
  pingAvg: number;
  pingMin: number;
  pingMax: number;
  jitter: number;
  downloadMbps: number;
  uploadMbps: number;
}

const STORAGE_KEY = 'speedtest-history';
const MAX_RESULTS = 3;

export function saveResult(result: TestResult): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    history.unshift(result);
    if (history.length > MAX_RESULTS) {
      history.length = MAX_RESULTS;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable
  }
}

export function getHistory(): TestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

export function formatResultForClipboard(result: TestResult): string {
  const date = new Date(result.timestamp).toLocaleString();
  return [
    `SpeedCheck Results - ${date}`,
    `Download: ${result.downloadMbps.toFixed(2)} Mbps`,
    `Upload: ${result.uploadMbps.toFixed(2)} Mbps`,
    `Ping: ${result.pingAvg.toFixed(1)} ms`,
    `Jitter: ${result.jitter.toFixed(1)} ms`,
  ].join('\n');
}
