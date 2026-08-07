import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { GetAppointmentsUseCase } from '@hexa/appointments-application';
import { appointmentsApiActions, appointmentsPageActions } from './appointments.actions';

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Appointments could not be loaded.';
}

@Injectable()
export class LoadAppointmentsEffects {
  readonly loadAppointments$;

  constructor(actions$: Actions, getAppointments: GetAppointmentsUseCase) {
    this.loadAppointments$ = createEffect(() =>
      actions$.pipe(
        ofType(appointmentsPageActions.opened, appointmentsPageActions.refreshed),
        switchMap(() =>
          getAppointments.execute().pipe(
            map((appointments) => appointmentsApiActions.loadedSuccess({ appointments })),
            catchError((error: unknown) =>
              of(appointmentsApiActions.loadedFailure({ message: toErrorMessage(error) }))
            )
          )
        )
      )
    );
  }
}
