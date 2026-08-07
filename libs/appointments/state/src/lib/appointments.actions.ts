import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Appointment } from '@hexa/appointments-domain';

export const appointmentsPageActions = createActionGroup({
  source: 'Appointments Page',
  events: {
    Opened: emptyProps(),
    Refreshed: emptyProps(),
  },
});

export const appointmentsApiActions = createActionGroup({
  source: 'Appointments API',
  events: {
    'Loaded Success': props<{ appointments: Appointment[] }>(),
    'Loaded Failure': props<{ message: string }>(),
  },
});
