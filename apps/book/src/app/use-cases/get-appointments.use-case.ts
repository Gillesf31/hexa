import { AppointmentsPort } from '../ports/appointments.port';

// A use-case may look overkill when it simply delegates to a port, but it
// becomes essential as business rules grow. This is where you would add
// filtering, sorting, authorization checks, combining multiple ports, or
// any orchestration logic — keeping that complexity out of the UI layer.
// Without a use-case, business rules leak into components, making them
// harder to test and impossible to reuse across different UIs.
// Plain class, not an Angular service: depends only on the port interface,
// so it's unit-testable by simply passing a mock to the constructor.
export class GetAppointmentsUseCase {
  constructor(private readonly appointmentsPort: AppointmentsPort) {}

  execute() {
    return this.appointmentsPort.getAppointments();
  }
}
