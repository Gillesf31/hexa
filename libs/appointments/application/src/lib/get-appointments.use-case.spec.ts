import { describe, expect, it } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';
import { GetAppointmentsUseCase } from './get-appointments.use-case';

const mockAppointments: Appointment[] = [
  { id: '1', customerName: 'Past', startsAt: new Date(2026, 6, 29, 9, 0), durationMinutes: 60 },
  { id: '2', customerName: 'Today', startsAt: new Date(2026, 6, 31, 10, 0), durationMinutes: 45 },
  { id: '3', customerName: 'Future', startsAt: new Date(2026, 7, 5, 14, 0), durationMinutes: 30 },
];

class FakeAppointmentsPort implements AppointmentsPort {
  getAppointments = () => of(mockAppointments);
}

class FakeClockPort implements ClockPort {
  constructor(private readonly currentInstant: Date) {}

  now(): Date {
    return this.currentInstant;
  }
}

describe('GetAppointmentsUseCase', () => {
  it('returns only today and future appointments', async () => {
    const useCase = new GetAppointmentsUseCase(new FakeAppointmentsPort(), new FakeClockPort(new Date(2026, 6, 31)));

    expect((await firstValueFrom(useCase.execute())).map((appointment) => appointment.id)).toEqual(['2', '3']);
  });

  it('returns all appointments when the clock is before all dates', async () => {
    const useCase = new GetAppointmentsUseCase(new FakeAppointmentsPort(), new FakeClockPort(new Date(2026, 6, 1)));

    expect(await firstValueFrom(useCase.execute())).toHaveLength(3);
  });

  it('returns empty when the clock is after all dates', async () => {
    const useCase = new GetAppointmentsUseCase(new FakeAppointmentsPort(), new FakeClockPort(new Date(2026, 8, 1)));

    expect(await firstValueFrom(useCase.execute())).toEqual([]);
  });
});
