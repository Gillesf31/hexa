import { ClockPort } from '../ports/clock.port';

export class SystemClockAdapter implements ClockPort {
  constructor(private readonly now: () => Date = () => new Date()) {}

  today(): string {
    const currentDate = this.now();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
