import type { ClockPort } from '@hexa/appointments-ports';

export class SystemClockAdapter implements ClockPort {
  constructor(private readonly currentInstant: () => Date = () => new Date()) {}

  now(): Date {
    return this.currentInstant();
  }
}
