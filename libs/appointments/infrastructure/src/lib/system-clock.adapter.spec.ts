import { describe, expect, it } from 'vitest';
import { SystemClockAdapter } from './system-clock.adapter';

describe('SystemClockAdapter', () => {
  it('returns the instant its source reports', () => {
    const instant = new Date(2026, 7, 1, 23, 30);

    expect(new SystemClockAdapter(() => instant).now()).toEqual(instant);
  });

  it('reads its source on every call rather than caching', () => {
    const instants = [new Date(2026, 0, 5, 8, 30), new Date(2026, 0, 5, 8, 31)];
    const clock = new SystemClockAdapter(() => instants.shift() as Date);

    expect(clock.now()).toEqual(new Date(2026, 0, 5, 8, 30));
    expect(clock.now()).toEqual(new Date(2026, 0, 5, 8, 31));
  });
});
