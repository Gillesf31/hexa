import { HttpClient } from '@angular/common/http';
import { inject, makeEnvironmentProviders } from '@angular/core';
import { Actions, createEffect, provideEffects } from '@ngrx/effects';
import {
  HttpAppointmentsAdapter,
  InMemoryAppointmentsAdapter,
  SystemClockAdapter,
} from '@hexa/appointments-infrastructure';
import {
  loadAppointments,
  provideAppointmentsState,
} from '@hexa/appointments-state';
import type { AppointmentsConfig } from './appointments.config';
import { APPOINTMENTS_PORT, CLOCK_PORT } from './port.tokens';

const appointmentsEffects = {
  loadAppointments: createEffect(
    (
      actions$ = inject(Actions),
      appointmentsPort = inject(APPOINTMENTS_PORT),
      clock = inject(CLOCK_PORT),
    ) => loadAppointments(actions$, appointmentsPort, clock),
    { functional: true },
  ),
};

export function provideAppointmentsShell(config: AppointmentsConfig) {
  return makeEnvironmentProviders([
    {
      provide: CLOCK_PORT,
      useFactory: () => new SystemClockAdapter(),
    },
    {
      provide: APPOINTMENTS_PORT,
      useFactory:
        config.dataSource === 'memory'
          ? () => new InMemoryAppointmentsAdapter()
          : () =>
              new HttpAppointmentsAdapter(
                inject(HttpClient),
                config.apiBaseUrl,
              ),
    },
    provideAppointmentsState(),
    provideEffects(appointmentsEffects),
  ]);
}
