import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  appointmentsFeature,
  appointmentsPageActions,
  selectAppointmentsErrorMessage,
  selectIsLoadingAppointments,
} from '@hexa/appointments-state';
import { AppointmentCardComponent } from '@hexa/appointments-ui';

@Component({
  imports: [AppointmentCardComponent],
  selector: 'app-root',
  template: `
    <div class="block max-w-xl mx-auto px-4 py-8 font-sans">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-100">Appointments</h1>
        <button
          type="button"
          class="text-sm text-gray-300 bg-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-600 disabled:opacity-50"
          [disabled]="isLoading()"
          (click)="refresh()"
        >
          Refresh
        </button>
      </div>

      @if (isLoading()) {
        <p class="text-center text-gray-500 py-8">Loading appointments…</p>
      } @else if (errorMessage(); as message) {
        <p class="text-center text-red-400 py-8">{{ message }}</p>
      } @else {
        <div class="flex flex-col gap-3">
          @for (appointment of appointments(); track appointment.id) {
            <app-appointment-card [appointment]="appointment" />
          } @empty {
            <p class="text-center text-gray-500 py-8">No appointments found.</p>
          }
        </div>
      }
    </div>
  `,
})
export class AppointmentBookComponent implements OnInit {
  private readonly store = inject(Store);

  readonly appointments = this.store.selectSignal(appointmentsFeature.selectAppointments);
  readonly isLoading = this.store.selectSignal(selectIsLoadingAppointments);
  readonly errorMessage = this.store.selectSignal(selectAppointmentsErrorMessage);

  ngOnInit(): void {
    this.store.dispatch(appointmentsPageActions.opened());
  }

  refresh(): void {
    this.store.dispatch(appointmentsPageActions.refreshed());
  }
}
