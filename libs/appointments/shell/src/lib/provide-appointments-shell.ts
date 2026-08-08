import { HttpClient } from '@angular/common/http';
import { inject, makeEnvironmentProviders } from '@angular/core';
import { GetAppointmentsUseCase } from '@hexa/appointments-application';
import {
  HttpAppointmentsAdapter,
  InMemoryAppointmentsAdapter,
  SystemClockAdapter,
} from '@hexa/appointments-infrastructure';
import { provideAppointmentsState } from '@hexa/appointments-state';
import { APPOINTMENTS_PORT, CLOCK_PORT } from './port.tokens';

export function provideAppointmentsShell(useInMemory = false) {
  return makeEnvironmentProviders([
    {
      provide: CLOCK_PORT,
      useFactory: () => new SystemClockAdapter(),
    },
    {
      provide: APPOINTMENTS_PORT,
      useFactory: useInMemory
        ? () => new InMemoryAppointmentsAdapter()
        : () => new HttpAppointmentsAdapter(inject(HttpClient)),
    },
    {
      provide: GetAppointmentsUseCase,
      useFactory: () => new GetAppointmentsUseCase(
        inject(APPOINTMENTS_PORT),
        inject(CLOCK_PORT)
      ),
    },
    provideAppointmentsState(),
  ]);
}
