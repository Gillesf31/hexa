import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetAppointmentsUseCase } from './use-cases/get-appointments.use-case';
import { AppointmentCardComponent } from './ui/appointment-card.component';

@Component({
  imports: [AppointmentCardComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  appointments = toSignal(inject(GetAppointmentsUseCase).execute());
}
