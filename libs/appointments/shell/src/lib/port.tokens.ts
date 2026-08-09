import { InjectionToken } from '@angular/core';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';

// How an implementation is located is a composition decision, so the tokens live
// here rather than next to the interfaces. `libs/appointments/ports` stays free
// of Angular and can be consumed outside it.
export const APPOINTMENTS_PORT = new InjectionToken<AppointmentsPort>(
  'AppointmentsPort',
);

export const CLOCK_PORT = new InjectionToken<ClockPort>('ClockPort');
