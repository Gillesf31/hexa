import type { Appointment } from './appointment';

export function filterCurrentAndFutureAppointments(
  appointments: Appointment[],
  today: string
): Appointment[] {
  return appointments.filter((appointment) => appointment.date >= today);
}

export function filterAppointmentsWithCustomerName(
  appointments: Appointment[]
): Appointment[] {
  return appointments.filter((appointment) => appointment.customerName.trim() !== '');
}
