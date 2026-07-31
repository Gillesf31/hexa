import { of } from 'rxjs';
import { Appointment } from '../domain/appointment.model';
import { AppointmentsPort } from '../ports/appointments.port';

// Plain class instead of @Injectable(): the adapter has no dependency on
// Angular's DI decorators, making it testable with a simple `new` call
// and reusable outside Angular (e.g. in a Node script or another framework).
// The Angular wiring (useFactory) lives in app.config.ts.
export class InMemoryAppointmentsAdapter implements AppointmentsPort {
  getAppointments = () => {
    return of<Appointment[]>([
      {
        id: 1,
        customerName: 'Gilles',
        date: '2026-01-01',
        startTime: '08:00',
        durationMinutes: 60,
      },
      {
        id: 2,
        customerName: 'Malo',
        date: '2026-01-01',
        startTime: '09:00',
        durationMinutes: 60,
      },
    ]);
  };
}
