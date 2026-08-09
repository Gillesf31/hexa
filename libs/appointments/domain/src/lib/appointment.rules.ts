import type { Appointment } from './appointment';

function startOfDay(instant: Date): Date {
  const start = new Date(instant);
  start.setHours(0, 0, 0, 0);

  return start;
}

export function filterCurrentAndFutureAppointments(
  appointments: Appointment[],
  now: Date,
): Appointment[] {
  const today = startOfDay(now);

  return appointments.filter((appointment) => appointment.startsAt >= today);
}

// The list identifies an appointment by its customer name, so a record without
// one cannot be recognised or acted on. Deliberately a filter, not a validation:
// see acceptance criterion 5 in docs/appointment-booking-business-requirements.md.
export function filterAppointmentsWithCustomerName(
  appointments: Appointment[],
): Appointment[] {
  return appointments.filter(
    (appointment) => appointment.customerName.trim() !== '',
  );
}

const REROUTED_MAX_DURATION_MINUTES = 30;

// An appointment of half an hour or less is handled by someone else, and the
// list has to say so: see acceptance criterion 8 in
// docs/appointment-booking-business-requirements.md. Deliberately a predicate,
// not a filter — the appointment is still displayed, it is who handles it that
// changes. The boundary is inclusive: exactly thirty minutes is re-routed.
export function isReroutedToAnotherAdvisor(appointment: Appointment): boolean {
  return appointment.durationMinutes <= REROUTED_MAX_DURATION_MINUTES;
}
