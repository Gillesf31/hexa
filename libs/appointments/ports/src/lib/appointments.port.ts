import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';

export interface AppointmentsPort {
  getAppointments: () => Observable<Appointment[]>;
}

export const APPOINTMENTS_PORT = new InjectionToken<AppointmentsPort>('AppointmentsPort');
