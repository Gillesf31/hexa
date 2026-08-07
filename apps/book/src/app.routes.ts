import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@hexa/appointments-shell').then((m) => m.appointmentsRoutes),
  },
];
