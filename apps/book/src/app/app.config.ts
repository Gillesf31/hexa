import { ApplicationConfig, inject, InjectionToken, provideBrowserGlobalErrorListeners, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppointmentsPort } from './ports/appointments.port';
import { ClockPort } from './ports/clock.port';
import { InMemoryAppointmentsAdapter } from './adapters/in-memory-appointments.adapter';
import { HttpAppointmentsAdapter } from './adapters/http-appointments.adapter';
import { SystemClockAdapter } from './adapters/system-clock.adapter';
import { GetAppointmentsUseCase } from './use-cases/get-appointments.use-case';

export const APPOINTMENTS_PORT = new InjectionToken<AppointmentsPort>(
  'AppointmentsPort'
);

export const CLOCK_PORT = new InjectionToken<ClockPort>('ClockPort');

export function provideAppointmentsPort(useInMemory = false): Provider[] {
  return [
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
  ];
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppointmentsPort(),
  ],
};
