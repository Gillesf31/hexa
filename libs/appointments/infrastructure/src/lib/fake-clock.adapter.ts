import type { ClockPort } from '@hexa/appointments-ports';

export class FakeClockAdapter implements ClockPort {
  constructor(private readonly fakeToday: string) {}

  today(): string {
    return this.fakeToday;
  }
}
