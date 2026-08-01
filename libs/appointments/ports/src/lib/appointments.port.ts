import type { Observable } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';

export interface AppointmentsPort {
  getAppointments: () => Observable<Appointment[]>;
}
