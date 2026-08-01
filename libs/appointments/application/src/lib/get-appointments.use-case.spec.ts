import { describe, expect, it } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';
import { GetAppointmentsUseCase } from './get-appointments.use-case';

const mockAppointments: Appointment[] = [
  { id: '1', customerName: 'Past', date: '2026-07-29', startTime: '09:00', durationMinutes: 60 },
  { id: '2', customerName: 'Today', date: '2026-07-31', startTime: '10:00', durationMinutes: 45 },
  { id: '3', customerName: 'Future', date: '2026-08-05', startTime: '14:00', durationMinutes: 30 },
];

class FakeAppointmentsPort implements AppointmentsPort {
  getAppointments = () => of(mockAppointments);
}

class FakeClockPort implements ClockPort {
  constructor(private readonly currentDay: string) {}

  today(): string {
    return this.currentDay;
  }
}

describe('GetAppointmentsUseCase', () => {
  it('returns only today and future appointments', async () => {
    const useCase = new GetAppointmentsUseCase(new FakeAppointmentsPort(), new FakeClockPort('2026-07-31'));

    expect((await firstValueFrom(useCase.execute())).map((appointment) => appointment.id)).toEqual(['2', '3']);
  });

  it('returns all appointments when the clock is before all dates', async () => {
    const useCase = new GetAppointmentsUseCase(new FakeAppointmentsPort(), new FakeClockPort('2026-07-01'));

    expect(await firstValueFrom(useCase.execute())).toHaveLength(3);
  });

  it('returns empty when the clock is after all dates', async () => {
    const useCase = new GetAppointmentsUseCase(new FakeAppointmentsPort(), new FakeClockPort('2026-09-01'));

    expect(await firstValueFrom(useCase.execute())).toEqual([]);
  });
});
