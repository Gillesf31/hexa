import { describe, expect, it } from 'vitest';
import { Actions } from '@ngrx/effects';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import type { Action } from '@ngrx/store';
import type { Appointment, ListedAppointment } from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';
import {
  appointmentsApiActions,
  appointmentsPageActions,
} from './appointments.actions';
import { loadAppointments } from './load-appointments.effects';

const now = new Date(2026, 6, 31);

const pastAppointment: Appointment = {
  id: '1',
  customerName: 'Past',
  startsAt: new Date(2026, 6, 29, 9, 0),
  durationMinutes: 60,
};

const futureAppointment: Appointment = {
  id: '2',
  customerName: 'Future',
  startsAt: new Date(2026, 7, 5, 14, 0),
  durationMinutes: 30,
};

// What the use case hands back: the appointment plus what the list says about
// it. Nothing here is due in an hour — the clock reads the thirty-first and the
// appointment is on the fifth of August.
const listedFutureAppointment: ListedAppointment = {
  ...futureAppointment,
  startingSoon: false,
};

function createEffects(
  appointmentsPort: AppointmentsPort,
  clock: ClockPort = { now: () => now },
) {
  const dispatched = new Subject<Action>();

  return {
    dispatched,
    effect: loadAppointments(new Actions(dispatched), appointmentsPort, clock),
  };
}

function appointmentsPort(appointments: Appointment[]): AppointmentsPort {
  return { getAppointments: () => of(appointments) };
}

function failingAppointmentsPort(error: unknown): AppointmentsPort {
  return { getAppointments: () => throwError(() => error) };
}

describe('loadAppointments', () => {
  it('emits the appointments kept by the use case when the page is opened', async () => {
    const { dispatched, effect } = createEffects(
      appointmentsPort([pastAppointment, futureAppointment]),
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({
        appointments: [listedFutureAppointment],
      }),
    );
  });

  it('emits the appointments again when the page is refreshed', async () => {
    const { dispatched, effect } = createEffects(
      appointmentsPort([futureAppointment]),
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.refreshed());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({
        appointments: [listedFutureAppointment],
      }),
    );
  });

  it('emits an empty list when every appointment is in the past', async () => {
    const { dispatched, effect } = createEffects(
      appointmentsPort([pastAppointment]),
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({ appointments: [] }),
    );
  });

  it('emits a failure carrying the error message when loading fails', async () => {
    const { dispatched, effect } = createEffects(
      failingAppointmentsPort(new Error('API unreachable')),
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedFailure({ message: 'API unreachable' }),
    );
  });

  it('emits a default failure message when the error is not an Error', async () => {
    const { dispatched, effect } = createEffects(
      failingAppointmentsPort('boom'),
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedFailure({
        message: 'Appointments could not be loaded.',
      }),
    );
  });

  it('keeps loading after a failure', async () => {
    let attempt = 0;
    const { dispatched, effect } = createEffects({
      getAppointments: () =>
        attempt++ === 0
          ? throwError(() => new Error('boom'))
          : of([futureAppointment]),
    });

    const emitted: Action[] = [];
    effect.subscribe((action) => emitted.push(action));
    dispatched.next(appointmentsPageActions.opened());
    dispatched.next(appointmentsPageActions.refreshed());

    expect(emitted).toEqual([
      appointmentsApiActions.loadedFailure({ message: 'boom' }),
      appointmentsApiActions.loadedSuccess({
        appointments: [listedFutureAppointment],
      }),
    ]);
  });

  it('keeps today and future appointments, then marks the imminent ones', async () => {
    const todayAppointment: Appointment = {
      id: '3',
      customerName: 'Today',
      startsAt: new Date(2026, 6, 31, 10, 0),
      durationMinutes: 45,
    };
    const blankNameAppointment: Appointment = {
      id: '4',
      customerName: '   ',
      startsAt: new Date(2026, 7, 5, 14, 0),
      durationMinutes: 30,
    };
    const { dispatched, effect } = createEffects(
      appointmentsPort([
        pastAppointment,
        todayAppointment,
        futureAppointment,
        blankNameAppointment,
      ]),
      { now: () => new Date(2026, 6, 31, 9, 30) },
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({
        appointments: [
          { ...todayAppointment, startingSoon: true },
          listedFutureAppointment,
        ],
      }),
    );
  });

  it('judges the whole list against one clock reading', async () => {
    let reading = 0;
    const imminentAppointment: Appointment = {
      id: '4',
      customerName: 'Imminent',
      startsAt: new Date(2026, 6, 31, 9, 45),
      durationMinutes: 30,
    };
    const { dispatched, effect } = createEffects(
      appointmentsPort([imminentAppointment]),
      {
        now: () =>
          [new Date(2026, 6, 31, 9, 0), new Date(2026, 6, 31, 10, 30)][
            Math.min(reading++, 1)
          ],
      },
    );

    const emitted = firstValueFrom(effect);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({
        appointments: [{ ...imminentAppointment, startingSoon: true }],
      }),
    );
    expect(reading).toBe(1);
  });
});
