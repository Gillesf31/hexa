import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAppointmentsFeature } from '@hexa/appointments-feature';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppointmentsFeature(),
  ],
};
