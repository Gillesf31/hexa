import { createFeature, createReducer, on } from '@ngrx/store';
import type { ListedAppointment } from '@hexa/appointments-domain';
import {
  appointmentsApiActions,
  appointmentsPageActions,
} from './appointments.actions';

export type AppointmentsStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export type AppointmentsState = {
  appointments: ListedAppointment[];
  status: AppointmentsStatus;
  errorMessage: string | null;
};

export const initialAppointmentsState: AppointmentsState = {
  appointments: [],
  status: 'idle',
  errorMessage: null,
};

export const appointmentsFeature = createFeature({
  name: 'appointments',
  reducer: createReducer(
    initialAppointmentsState,
    on(
      appointmentsPageActions.opened,
      appointmentsPageActions.refreshed,
      (state): AppointmentsState => ({
        ...state,
        status: 'loading',
        errorMessage: null,
      }),
    ),
    on(
      appointmentsApiActions.loadedSuccess,
      (state, { appointments }): AppointmentsState => ({
        ...state,
        appointments,
        status: 'loaded',
        errorMessage: null,
      }),
    ),
    on(
      appointmentsApiActions.loadedFailure,
      (state, { message }): AppointmentsState => ({
        ...state,
        appointments: [],
        status: 'failed',
        errorMessage: message,
      }),
    ),
  ),
});
