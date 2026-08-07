import type { Routes } from '@angular/router';
import { AppointmentBookComponent } from '@hexa/appointments-feature';
import { provideAppointmentsShell } from './provide-appointments-shell';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    providers: [provideAppointmentsShell()],
    children: [{ path: '', component: AppointmentBookComponent }],
  },
];
