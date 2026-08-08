import { describe, expect, it } from 'vitest';
import { FakeClockAdapter } from './fake-clock.adapter';

describe('FakeClockAdapter', () => {
  it('returns the fixed instant it was constructed with', () => {
    const instant = new Date(2026, 7, 5, 10, 30);

    expect(new FakeClockAdapter(instant).now()).toEqual(instant);
  });

  it('returns the same instant on every call', () => {
    const clock = new FakeClockAdapter(new Date(2026, 0, 1, 0, 0));

    expect(clock.now()).toEqual(new Date(2026, 0, 1, 0, 0));
    expect(clock.now()).toEqual(new Date(2026, 0, 1, 0, 0));
  });
});
