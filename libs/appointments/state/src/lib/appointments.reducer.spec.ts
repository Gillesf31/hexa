import { describe, expect, it } from 'vitest';
import type { Appointment } from '@hexa/appointments-domain';
import { appointmentsApiActions, appointmentsPageActions } from './appointments.actions';
import { appointmentsFeature, initialAppointmentsState } from './appointments.reducer';
import type { AppointmentsState } from './appointments.reducer';

const { reducer } = appointmentsFeature;

const appointment: Appointment = {
  id: '1',
  customerName: 'Alice',
  date: '2026-08-05',
  startTime: '14:00',
  durationMinutes: 30,
};

const failedState: AppointmentsState = {
  appointments: [],
  status: 'failed',
  errorMessage: 'API unreachable',
};

describe('appointments reducer', () => {
  it('starts idle without appointments', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialAppointmentsState);
  });

  it('moves to loading when the page is opened', () => {
    expect(reducer(initialAppointmentsState, appointmentsPageActions.opened())).toEqual({
      appointments: [],
      status: 'loading',
      errorMessage: null,
    });
  });

  it('clears a previous error when the page is refreshed', () => {
    expect(reducer(failedState, appointmentsPageActions.refreshed())).toEqual({
      appointments: [],
      status: 'loading',
      errorMessage: null,
    });
  });

  it('keeps the current appointments visible while refreshing', () => {
    const loadedState: AppointmentsState = {
      appointments: [appointment],
      status: 'loaded',
      errorMessage: null,
    };

    expect(reducer(loadedState, appointmentsPageActions.refreshed()).appointments).toEqual([appointment]);
  });

  it('stores the loaded appointments', () => {
    const loadingState: AppointmentsState = {
      appointments: [],
      status: 'loading',
      errorMessage: null,
    };

    expect(
      reducer(loadingState, appointmentsApiActions.loadedSuccess({ appointments: [appointment] }))
    ).toEqual({
      appointments: [appointment],
      status: 'loaded',
      errorMessage: null,
    });
  });

  it('drops stale appointments and keeps the message when loading fails', () => {
    const loadedState: AppointmentsState = {
      appointments: [appointment],
      status: 'loaded',
      errorMessage: null,
    };

    expect(
      reducer(loadedState, appointmentsApiActions.loadedFailure({ message: 'API unreachable' }))
    ).toEqual(failedState);
  });
});
