import { InjectionToken } from '@angular/core';

export interface ClockPort {
  today(): string;
}

export const CLOCK_PORT = new InjectionToken<ClockPort>('ClockPort');
