interface RateLimitEntry {
  lastTest: number;
  running: boolean;
}

const ipMap = new Map<string, RateLimitEntry>();

const COOLDOWN_MS = 60_000;
const CLEANUP_INTERVAL_MS = 300_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    ipMap.forEach((entry, ip) => {
      if (now - entry.lastTest > COOLDOWN_MS * 2 && !entry.running) {
        keysToDelete.push(ip);
      }
    });
    keysToDelete.forEach((ip) => ipMap.delete(ip));
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  ensureCleanup();
  const entry = ipMap.get(ip);
  if (!entry) return { allowed: true };

  if (entry.running) {
    return { allowed: false, retryAfterSeconds: 10 };
  }

  const elapsed = Date.now() - entry.lastTest;
  if (elapsed < COOLDOWN_MS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000),
    };
  }

  return { allowed: true };
}

export function markTestStart(ip: string): void {
  ipMap.set(ip, { lastTest: Date.now(), running: true });
}

export function markTestEnd(ip: string): void {
  const entry = ipMap.get(ip);
  if (entry) {
    entry.running = false;
    entry.lastTest = Date.now();
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || 'unknown';
}
