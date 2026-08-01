import { bootstrapApplication } from '@angular/platform-browser';
import { AppointmentBookComponent } from '@hexa/appointments-feature';
import { appConfig } from './app.config';

bootstrapApplication(AppointmentBookComponent, appConfig).catch((err) =>
  console.error(err)
);
