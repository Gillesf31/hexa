import { describe, expect, it } from 'vitest';
import { SystemClockAdapter } from './system-clock.adapter';

describe('SystemClockAdapter', () => {
  it('returns the current local calendar date', () => {
    const clock = new SystemClockAdapter(
      () => new Date(2026, 7, 1, 23, 30)
    );

    expect(clock.today()).toBe('2026-08-01');
  });

  it('pads month and day to match the date contract', () => {
    const clock = new SystemClockAdapter(
      () => new Date(2026, 0, 5, 8, 30)
    );

    expect(clock.today()).toBe('2026-01-05');
  });
});
