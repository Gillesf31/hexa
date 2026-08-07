import { Component, input } from '@angular/core';
import type { Appointment } from '@hexa/appointments-domain';
import { AppointmentCardComponent } from './appointment-card.component';
import { StatusMessageComponent } from './status-message.component';

@Component({
  selector: 'app-appointment-list',
  imports: [AppointmentCardComponent, StatusMessageComponent],
  template: `
    <div class="flex flex-col gap-3">
      @for (appointment of appointments(); track appointment.id) {
        <app-appointment-card [appointment]="appointment" />
      } @empty {
        <app-status-message>No appointments found.</app-status-message>
      }
    </div>
  `,
})
export class AppointmentListComponent {
  readonly appointments = input.required<readonly Appointment[]>();
}
