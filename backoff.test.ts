import { expect, test } from 'vitest';
import { nextBackoffMs } from './backoff';

test('grows exponentially from 1s', () => {
  expect(nextBackoffMs(0, 0)).toBe(1000);
  expect(nextBackoffMs(1, 0)).toBe(2000);
  expect(nextBackoffMs(2, 0)).toBe(4000);
  expect(nextBackoffMs(4, 0)).toBe(16000);
});

test('caps at 30s', () => {
  expect(nextBackoffMs(10, 0)).toBe(30000);
});

test('adds jitter in [0, 1000)', () => {
  const v = nextBackoffMs(0, 0.5);
  expect(v).toBeGreaterThanOrEqual(1000);
  expect(v).toBeLessThan(2000);
});
