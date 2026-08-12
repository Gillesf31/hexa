import { map } from 'rxjs';
import {
  filterAppointmentsWithCustomerName,
  filterCurrentAndFutureAppointments,
  isStartingSoon,
} from '@hexa/appointments-domain';
import type { ListedAppointment } from '@hexa/appointments-domain';
import type { AppointmentsPort, ClockPort } from '@hexa/appointments-ports';

export class GetAppointmentsUseCase {
  constructor(
    private readonly appointmentsPort: AppointmentsPort,
    private readonly clock: ClockPort,
  ) {}

  execute() {
    return this.appointmentsPort.getAppointments().pipe(
      map((appointments): ListedAppointment[] => {
        // One reading of the clock serves every rule: see acceptance criterion
        // 15. Consulting it again for the second rule lets the two disagree —
        // an appointment can be current under the first reading and already
        // past under the second, and either side of midnight they would not
        // even agree which day it is.
        const now = this.clock.now();

        const displayed = filterAppointmentsWithCustomerName(
          filterCurrentAndFutureAppointments(appointments, now),
        );

        return displayed.map((appointment) => ({
          ...appointment,
          startingSoon: isStartingSoon(appointment, now),
        }));
      }),
    );
  }
}
