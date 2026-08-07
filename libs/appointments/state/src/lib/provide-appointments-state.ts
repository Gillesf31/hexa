import { makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { appointmentsFeature } from './appointments.reducer';
import { LoadAppointmentsEffects } from './load-appointments.effects';

export function provideAppointmentsState() {
  return makeEnvironmentProviders([
    provideState(appointmentsFeature),
    provideEffects(LoadAppointmentsEffects),
  ]);
}
