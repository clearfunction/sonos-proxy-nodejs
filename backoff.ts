const BASE_MS = 1000;
const CAP_MS = 30_000;
const JITTER_MS = 1000;

/**
 * Exponential backoff with a cap and additive jitter.
 * @param attempt  consecutive failed attempts (0-based)
 * @param rand     a value in [0,1); defaults to Math.random() (injectable for tests)
 */
export function nextBackoffMs(attempt: number, rand: number = Math.random()): number {
  const base = Math.min(CAP_MS, BASE_MS * 2 ** attempt);
  return base + Math.floor(rand * JITTER_MS);
}
