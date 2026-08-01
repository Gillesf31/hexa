import { HttpClient } from '@angular/common/http';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort } from '@hexa/appointments-ports';

export class HttpAppointmentsAdapter implements AppointmentsPort {
  constructor(private readonly http: HttpClient) {}

  getAppointments = () => this.http.get<Appointment[]>('http://localhost:3000/appointments');
}
