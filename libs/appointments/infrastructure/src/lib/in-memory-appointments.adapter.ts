import { of } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort } from '@hexa/appointments-ports';

type AppointmentSeed = Omit<Appointment, 'date'> & { dayOffset: number };

const appointmentSeeds: AppointmentSeed[] = [
  { id: '1', customerName: 'Gilles', dayOffset: -6, startTime: '09:00', durationMinutes: 60 },
  { id: '2', customerName: 'Malo', dayOffset: -1, startTime: '10:00', durationMinutes: 45 },
  { id: '3', customerName: 'Alice', dayOffset: 0, startTime: '14:00', durationMinutes: 30 },
  { id: '4', customerName: 'Bob', dayOffset: 0, startTime: '16:30', durationMinutes: 60 },
  { id: '5', customerName: 'Clara', dayOffset: 2, startTime: '11:00', durationMinutes: 90 },
  { id: '6', customerName: 'David', dayOffset: 9, startTime: '08:30', durationMinutes: 30 },
];

export class InMemoryAppointmentsAdapter implements AppointmentsPort {
  constructor(private readonly now: () => Date = () => new Date()) {}

  getAppointments = () =>
    of<Appointment[]>(
      appointmentSeeds.map(({ dayOffset, ...appointment }) => ({
        ...appointment,
        date: this.dateFromToday(dayOffset),
      }))
    );

  private dateFromToday(dayOffset: number): string {
    const date = this.now();
    date.setDate(date.getDate() + dayOffset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
