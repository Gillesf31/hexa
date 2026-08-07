import { describe, expect, it } from 'vitest';
import { FakeClockAdapter } from './fake-clock.adapter';

describe('FakeClockAdapter', () => {
  it('returns the fixed date it was constructed with', () => {
    expect(new FakeClockAdapter('2026-08-05').today()).toBe('2026-08-05');
  });

  it('returns the same date on every call', () => {
    const clock = new FakeClockAdapter('2026-01-01');

    expect(clock.today()).toBe('2026-01-01');
    expect(clock.today()).toBe('2026-01-01');
  });
});
