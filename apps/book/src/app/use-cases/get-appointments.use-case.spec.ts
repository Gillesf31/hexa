import { describe, it, expect } from 'vitest';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Appointment } from '../domain/appointment.model';
import { AppointmentsPort } from '../ports/appointments.port';
import { FakeClockAdapter } from '../adapters/fake-clock.adapter';
import { GetAppointmentsUseCase } from './get-appointments.use-case';

const mockAppointments: Appointment[] = [
  { id: 1, customerName: 'Past',    date: '2026-07-29', startTime: '09:00', durationMinutes: 60 },
  { id: 2, customerName: 'Today',   date: '2026-07-31', startTime: '10:00', durationMinutes: 45 },
  { id: 3, customerName: 'Future',  date: '2026-08-05', startTime: '14:00', durationMinutes: 30 },
];

class FakeAppointmentsAdapter implements AppointmentsPort {
  getAppointments = () => of(mockAppointments);
}

describe('GetAppointmentsUseCase', () => {
  it('should return only today and future appointments', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsAdapter(),
      new FakeClockAdapter('2026-07-31')
    );

    const result = await firstValueFrom(useCase.execute());
    expect(result.map((a) => a.id)).toEqual([2, 3]);
  });

  it('should return all appointments when clock is before all dates', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsAdapter(),
      new FakeClockAdapter('2026-07-01')
    );

    const result = await firstValueFrom(useCase.execute());
    expect(result).toHaveLength(3);
  });

  it('should return empty when clock is after all dates', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsAdapter(),
      new FakeClockAdapter('2026-09-01')
    );

    const result = await firstValueFrom(useCase.execute());
    expect(result).toHaveLength(0);
  });
});
