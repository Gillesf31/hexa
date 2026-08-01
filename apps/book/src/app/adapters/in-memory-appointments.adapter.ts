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
        id: '1',
        customerName: 'Gilles',
        date: '2026-07-30',
        startTime: '09:00',
        durationMinutes: 60,
      },
      {
        id: '2',
        customerName: 'Malo',
        date: '2026-07-31',
        startTime: '10:00',
        durationMinutes: 45,
      },
      {
        id: '3',
        customerName: 'Alice',
        date: '2026-08-01',
        startTime: '14:00',
        durationMinutes: 30,
      },
      {
        id: '4',
        customerName: 'Bob',
        date: '2026-08-03',
        startTime: '11:00',
        durationMinutes: 60,
      },
      {
        id: '5',
        customerName: 'Clara',
        date: '2026-08-05',
        startTime: '16:00',
        durationMinutes: 90,
      },
    ]);
  };
}
