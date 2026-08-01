import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetAppointmentsUseCase } from '@hexa/appointments-application';
import { AppointmentCardComponent } from './appointment-card.component';

@Component({
  imports: [AppointmentCardComponent],
  selector: 'app-root',
  template: `
    <div class="block max-w-xl mx-auto px-4 py-8 font-sans">
      <h1 class="text-2xl font-bold mb-6 text-gray-100">Appointments</h1>

      <div class="flex flex-col gap-3">
        @for (appointment of appointments(); track appointment.id) {
          <app-appointment-card [appointment]="appointment" />
        } @empty {
          <p class="text-center text-gray-500 py-8">No appointments found.</p>
        }
      </div>
    </div>
  `,
})
export class AppointmentBookComponent {
  readonly appointments = toSignal(inject(GetAppointmentsUseCase).execute());
}
