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

const STARTING_SOON_WITHIN_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60_000;

// The list says of an imminent appointment that it is starting soon: see
// acceptance criteria 9 to 12 in
// docs/appointment-booking-business-requirements.md. Deliberately a predicate,
// not a filter — like re-routing, the appointment is still displayed and only
// what the list says about it changes. The instant is passed in rather than
// read here, so every rule can be judged against one reading of the clock.
//
// The window has two ends, and the lower one is not decoration: appointments
// are excluded by day, so one at nine o'clock is still displayed at four in
// the afternoon. It is seven hours "within the next hour" of the horizon, and
// without `>= now` the list would announce it as imminent.
export function isStartingSoon(appointment: Appointment, now: Date): boolean {
  const horizon = new Date(
    now.getTime() + STARTING_SOON_WITHIN_MINUTES * MILLISECONDS_PER_MINUTE,
  );

  return appointment.startsAt >= now && appointment.startsAt <= horizon;
}
