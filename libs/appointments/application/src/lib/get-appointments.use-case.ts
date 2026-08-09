import { map } from 'rxjs';
import {
  filterAppointmentsWithCustomerName,
  filterCurrentAndFutureAppointments,
} from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';

export class GetAppointmentsUseCase {
  constructor(
    private readonly appointmentsPort: AppointmentsPort,
    private readonly clock: ClockPort,
  ) {}

  execute() {
    return this.appointmentsPort.getAppointments().pipe(
      map((appointments) =>
        filterCurrentAndFutureAppointments(appointments, this.clock.now()),
      ),
      map(filterAppointmentsWithCustomerName),
    );
  }
}
