import { createSelector } from '@ngrx/store';
import { appointmentsFeature } from './appointments.reducer';

export const selectIsLoadingAppointments = createSelector(
  appointmentsFeature.selectStatus,
  (status) => status === 'loading',
);

export const selectAppointmentsErrorMessage = createSelector(
  appointmentsFeature.selectStatus,
  appointmentsFeature.selectErrorMessage,
  (status, errorMessage) => (status === 'failed' ? errorMessage : null),
);
