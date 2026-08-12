import { describe, expect, it } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';
import { GetAppointmentsUseCase } from './get-appointments.use-case';

const mockAppointments: Appointment[] = [
  {
    id: '1',
    customerName: 'Past',
    startsAt: new Date(2026, 6, 29, 9, 0),
    durationMinutes: 60,
  },
  {
    id: '2',
    customerName: 'Today',
    startsAt: new Date(2026, 6, 31, 10, 0),
    durationMinutes: 45,
  },
  {
    id: '3',
    customerName: 'Future',
    startsAt: new Date(2026, 7, 5, 14, 0),
    durationMinutes: 30,
  },
];

class FakeAppointmentsPort implements AppointmentsPort {
  constructor(
    private readonly appointments: Appointment[] = mockAppointments,
  ) {}

  getAppointments = () => of(this.appointments);
}

class FakeClockPort implements ClockPort {
  constructor(private readonly currentInstant: Date) {}

  now(): Date {
    return this.currentInstant;
  }
}

// Answers a later instant on each reading, the way a real clock would if the
// list were judged twice. Once the instants run out it keeps returning the
// last one, so the number of readings is not what the test is about.
class AdvancingClockPort implements ClockPort {
  private reading = 0;

  constructor(private readonly instants: Date[]) {}

  now(): Date {
    return this.instants[Math.min(this.reading++, this.instants.length - 1)];
  }
}

describe('GetAppointmentsUseCase', () => {
  it('returns only today and future appointments', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsPort(),
      new FakeClockPort(new Date(2026, 6, 31)),
    );

    expect(
      (await firstValueFrom(useCase.execute())).map(
        (appointment) => appointment.id,
      ),
    ).toEqual(['2', '3']);
  });

  it('returns all appointments when the clock is before all dates', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsPort(),
      new FakeClockPort(new Date(2026, 6, 1)),
    );

    expect(await firstValueFrom(useCase.execute())).toHaveLength(3);
  });

  it('returns empty when the clock is after all dates', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsPort(),
      new FakeClockPort(new Date(2026, 8, 1)),
    );

    expect(await firstValueFrom(useCase.execute())).toEqual([]);
  });

  // Where the boundary of "starting soon" lies is settled in the domain; what
  // this pins is that the answer reaches the list, appointment by appointment,
  // without disturbing the four fields the list already shows.
  it('hands the list back with the imminent appointment announced and the later one not', async () => {
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsPort(),
      new FakeClockPort(new Date(2026, 6, 31, 9, 30)),
    );

    expect(await firstValueFrom(useCase.execute())).toEqual([
      { ...mockAppointments[1], startingSoon: true },
      { ...mockAppointments[2], startingSoon: false },
    ]);
  });

  // The appointment is forty-five minutes away at nine o'clock and three
  // quarters of an hour past at half ten. Read once, it is announced. Consult
  // the clock again for the second rule and the same appointment is history —
  // which is what a second `now()` in a second `map` would do, and is also how
  // two readings either side of midnight would disagree about the day.
  it('judges the whole list against one reading of the clock, even when time moves on while it is prepared', async () => {
    const imminentAppointment: Appointment = {
      id: '4',
      customerName: 'Imminent',
      startsAt: new Date(2026, 6, 31, 9, 45),
      durationMinutes: 30,
    };
    const useCase = new GetAppointmentsUseCase(
      new FakeAppointmentsPort([imminentAppointment]),
      new AdvancingClockPort([
        new Date(2026, 6, 31, 9, 0),
        new Date(2026, 6, 31, 10, 30),
      ]),
    );

    expect(await firstValueFrom(useCase.execute())).toEqual([
      { ...imminentAppointment, startingSoon: true },
    ]);
  });
});
