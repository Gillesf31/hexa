import type { Routes } from '@angular/router';
import { AppointmentsPageComponent } from '@hexa/appointments-feature';
import type { AppointmentsConfig } from './appointments.config';
import { provideAppointmentsShell } from './provide-appointments-shell';

export function appointmentsRoutes(config: AppointmentsConfig): Routes {
  return [
    {
      path: '',
      providers: [provideAppointmentsShell(config)],
      children: [{ path: '', component: AppointmentsPageComponent }],
    },
  ];
}
