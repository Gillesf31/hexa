import type { Routes } from '@angular/router';
import { environment } from './environments/environment';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@hexa/appointments-shell').then((m) =>
        m.appointmentsRoutes(environment.appointments),
      ),
  },
];
