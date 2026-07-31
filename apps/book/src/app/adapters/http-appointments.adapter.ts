import { HttpClient } from '@angular/common/http';
import { Appointment } from '../domain/appointment.model';
import { AppointmentsPort } from '../ports/appointments.port';

// Plain class with constructor injection instead of @Injectable() + inject().
// Dependencies are explicit constructor parameters, so the class can be
// instantiated manually in tests or outside Angular. The framework-specific
// wiring (providing HttpClient) is handled in app.config.ts via useFactory.
export class HttpAppointmentsAdapter implements AppointmentsPort {
  constructor(private readonly http: HttpClient) {}

  getAppointments = () => {
    return this.http.get<Appointment[]>('http://localhost:3000/appointments');
  };
}
