import { InjectionToken } from '@angular/core';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';

// Locating concrete adapters is a composition decision. Effects only describe
// the abstract dependencies their operation needs.
export const APPOINTMENTS_PORT = new InjectionToken<AppointmentsPort>(
  'AppointmentsPort',
);

export const CLOCK_PORT = new InjectionToken<ClockPort>('ClockPort');
