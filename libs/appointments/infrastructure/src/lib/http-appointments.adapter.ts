import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort } from '@hexa/appointments-ports';

// The API's shape, not the domain's. Never exported: nothing outside this file
// may depend on what json-server happens to return.
type AppointmentDto = {
  id: string;
  customerName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
};

// The API splits an appointment's start across two strings; the domain wants the
// single instant those two describe. This is the whole reason the seam exists.
function toStartsAt(date: string, startTime: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: dto.id,
    customerName: dto.customerName,
    startsAt: toStartsAt(dto.date, dto.startTime),
    durationMinutes: dto.durationMinutes,
  };
}

export class HttpAppointmentsAdapter implements AppointmentsPort {
  constructor(private readonly http: HttpClient) {}

  getAppointments = () =>
    this.http
      .get<AppointmentDto[]>('http://localhost:3000/appointments')
      .pipe(map((dtos) => dtos.map(toAppointment)));
}
