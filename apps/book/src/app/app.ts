import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GET_APPOINTMENTS_USE_CASE } from './app.config';

@Component({
  imports: [],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // PO: Je veux que l'utilisateur puisse voir des rendez-vous
  appointments = toSignal(inject(GET_APPOINTMENTS_USE_CASE).execute());
}
