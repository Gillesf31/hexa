import type { ClockPort } from '@hexa/appointments-ports';

export class FakeClockAdapter implements ClockPort {
  constructor(private readonly fakeNow: Date) {}

  now(): Date {
    return this.fakeNow;
  }
}
