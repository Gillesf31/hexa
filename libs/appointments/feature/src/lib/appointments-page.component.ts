import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  appointmentsFeature,
  appointmentsPageActions,
  selectAppointmentsErrorMessage,
  selectIsLoadingAppointments,
} from '@hexa/appointments-state';
import {
  AppointmentListComponent,
  AppointmentsHeaderComponent,
  StatusMessageComponent,
} from '@hexa/appointments-ui';

@Component({
  imports: [
    AppointmentListComponent,
    AppointmentsHeaderComponent,
    StatusMessageComponent,
  ],
  selector: 'app-appointments-page',
  template: `
    <div class="block max-w-xl mx-auto px-4 py-8 font-sans">
      <app-appointments-header [busy]="isLoading()" (refresh)="refresh()">
        Appointments
      </app-appointments-header>

      @if (isLoading()) {
        <app-status-message>Loading appointments…</app-status-message>
      } @else if (errorMessage(); as message) {
        <app-status-message variant="error">{{ message }}</app-status-message>
      } @else {
        <app-appointment-list [appointments]="appointments()" />
      }
    </div>
  `,
})
export class AppointmentsPageComponent implements OnInit {
  private readonly store = inject(Store);

  readonly appointments = this.store.selectSignal(
    appointmentsFeature.selectAppointments,
  );
  readonly isLoading = this.store.selectSignal(selectIsLoadingAppointments);
  readonly errorMessage = this.store.selectSignal(
    selectAppointmentsErrorMessage,
  );

  ngOnInit(): void {
    this.store.dispatch(appointmentsPageActions.opened());
  }

  refresh(): void {
    this.store.dispatch(appointmentsPageActions.refreshed());
  }
}
