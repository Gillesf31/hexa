import { describe, expect, it } from 'vitest';
import { Actions } from '@ngrx/effects';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import type { Action } from '@ngrx/store';
import type { Appointment } from '@hexa/appointments-domain';
import { GetAppointmentsUseCase } from '@hexa/appointments-application';
import {
  appointmentsApiActions,
  appointmentsPageActions,
} from './appointments.actions';
import { LoadAppointmentsEffects } from './load-appointments.effects';

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

function createEffects(getAppointments: GetAppointmentsUseCase) {
  const dispatched = new Subject<Action>();

  return {
    dispatched,
    effects: new LoadAppointmentsEffects(
      new Actions(dispatched),
      getAppointments,
    ),
  };
}

function createUseCase(appointments: Appointment[]) {
  return new GetAppointmentsUseCase(
    { getAppointments: () => of(appointments) },
    { now: () => now },
  );
}

function createFailingUseCase(error: unknown) {
  return new GetAppointmentsUseCase(
    { getAppointments: () => throwError(() => error) },
    { now: () => now },
  );
}

describe('LoadAppointmentsEffects', () => {
  it('emits the appointments kept by the use case when the page is opened', async () => {
    const { dispatched, effects } = createEffects(
      createUseCase([pastAppointment, futureAppointment]),
    );

    const emitted = firstValueFrom(effects.loadAppointments$);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({
        appointments: [futureAppointment],
      }),
    );
  });

  it('emits the appointments again when the page is refreshed', async () => {
    const { dispatched, effects } = createEffects(
      createUseCase([futureAppointment]),
    );

    const emitted = firstValueFrom(effects.loadAppointments$);
    dispatched.next(appointmentsPageActions.refreshed());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedSuccess({
        appointments: [futureAppointment],
      }),
    );
  });

  it('emits a failure carrying the error message when loading fails', async () => {
    const { dispatched, effects } = createEffects(
      createFailingUseCase(new Error('API unreachable')),
    );

    const emitted = firstValueFrom(effects.loadAppointments$);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedFailure({ message: 'API unreachable' }),
    );
  });

  it('emits a default failure message when the error is not an Error', async () => {
    const { dispatched, effects } = createEffects(createFailingUseCase('boom'));

    const emitted = firstValueFrom(effects.loadAppointments$);
    dispatched.next(appointmentsPageActions.opened());

    expect(await emitted).toEqual(
      appointmentsApiActions.loadedFailure({
        message: 'Appointments could not be loaded.',
      }),
    );
  });

  it('keeps loading after a failure', async () => {
    let attempt = 0;
    const useCase = new GetAppointmentsUseCase(
      {
        getAppointments: () =>
          attempt++ === 0
            ? throwError(() => new Error('boom'))
            : of([futureAppointment]),
      },
      { now: () => now },
    );
    const { dispatched, effects } = createEffects(useCase);

    const emitted: Action[] = [];
    effects.loadAppointments$.subscribe((action) => emitted.push(action));
    dispatched.next(appointmentsPageActions.opened());
    dispatched.next(appointmentsPageActions.refreshed());

    expect(emitted).toEqual([
      appointmentsApiActions.loadedFailure({ message: 'boom' }),
      appointmentsApiActions.loadedSuccess({
        appointments: [futureAppointment],
      }),
    ]);
  });
});
