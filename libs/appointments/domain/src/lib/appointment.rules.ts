import type { Appointment } from './appointment';

function startOfDay(instant: Date): Date {
  const start = new Date(instant);
  start.setHours(0, 0, 0, 0);

  return start;
}

export function filterCurrentAndFutureAppointments(
  appointments: Appointment[],
  now: Date
): Appointment[] {
  const today = startOfDay(now);

  return appointments.filter((appointment) => appointment.startsAt >= today);
}

export function filterAppointmentsWithCustomerName(
  appointments: Appointment[]
): Appointment[] {
  return appointments.filter((appointment) => appointment.customerName.trim() !== '');
}
