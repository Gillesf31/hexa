import { Actions, ofType } from '@ngrx/effects';
import type { Action } from '@ngrx/store';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import {
  filterAppointmentsWithCustomerName,
  filterCurrentAndFutureAppointments,
  isStartingSoon,
} from '@hexa/appointments-domain';
import type { ListedAppointment } from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';
import {
  appointmentsApiActions,
  appointmentsPageActions,
} from './appointments.actions';

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Appointments could not be loaded.';
}

// The Redux use case. Its caller supplies the action stream and the two ports;
// Angular DI remains in the shell that composes those dependencies.
export function loadAppointments(
  actions$: Actions,
  appointmentsPort: AppointmentsPort,
  clock: ClockPort,
): Observable<Action> {
  return actions$.pipe(
    ofType(appointmentsPageActions.opened, appointmentsPageActions.refreshed),
    switchMap(() =>
      appointmentsPort.getAppointments().pipe(
        map((appointments): ListedAppointment[] => {
          // The whole list must be judged at one instant. A second clock
          // reading could disagree after an appointment starts or midnight
          // passes while the list is being prepared.
          const now = clock.now();
          const displayed = filterAppointmentsWithCustomerName(
            filterCurrentAndFutureAppointments(appointments, now),
          );

          return displayed.map((appointment) => ({
            ...appointment,
            startingSoon: isStartingSoon(appointment, now),
          }));
        }),
        map((appointments) =>
          appointmentsApiActions.loadedSuccess({ appointments }),
        ),
        catchError((error: unknown) =>
          of(
            appointmentsApiActions.loadedFailure({
              message: toErrorMessage(error),
            }),
          ),
        ),
      ),
    ),
  );
}
