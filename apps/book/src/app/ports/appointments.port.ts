import { Observable } from 'rxjs';
import { Appointment } from '../domain/appointment.model';

// A port is an interface, not a class, because it defines a contract
// ("what can be done") without any implementation ("how it's done").
// This ensures inner layers (domain, use-cases) never depend on concrete
// details — only adapters decide how to fulfill the contract.
// Interfaces are also erased at compile time (zero runtime overhead),
// which is why Angular needs an InjectionToken to represent them for DI.
export interface AppointmentsPort {
  getAppointments: () => Observable<Appointment[]>;
}
