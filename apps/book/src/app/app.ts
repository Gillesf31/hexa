import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GET_APPOINTMENTS_USE_CASE } from './app.config';
import { AppointmentCardComponent } from './ui/appointment-card.component';

@Component({
  imports: [AppointmentCardComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  appointments = toSignal(inject(GET_APPOINTMENTS_USE_CASE).execute());
}
