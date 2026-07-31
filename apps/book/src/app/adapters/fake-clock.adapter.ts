import { ClockPort } from '../ports/clock.port';

export class FakeClockAdapter implements ClockPort {
  constructor(private readonly fakeToday: string) {}

  today(): string {
    return this.fakeToday;
  }
}
