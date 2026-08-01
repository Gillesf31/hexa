import { HttpClient, provideHttpClient } from '@angular/common/http';
import { inject, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { GetAppointmentsUseCase } from '@hexa/appointments-application';
import {
  HttpAppointmentsAdapter,
  InMemoryAppointmentsAdapter,
  SystemClockAdapter,
} from '@hexa/appointments-infrastructure';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';

export const APPOINTMENTS_PORT = new InjectionToken<AppointmentsPort>('AppointmentsPort');
export const CLOCK_PORT = new InjectionToken<ClockPort>('ClockPort');

export function provideAppointmentsFeature(useInMemory = false) {
  return makeEnvironmentProviders([
    provideHttpClient(),
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
  ]);
}
