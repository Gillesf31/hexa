import { makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { appointmentsFeature } from './appointments.reducer';

export function provideAppointmentsState() {
  return makeEnvironmentProviders([provideState(appointmentsFeature)]);
}
