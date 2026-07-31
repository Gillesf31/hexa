import { ClockPort } from '../ports/clock.port';

export class SystemClockAdapter implements ClockPort {
  today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
