export type Appointment = {
  id: string;
  customerName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
};

export function filterPastAppointments(
  appointments: Appointment[],
  today: string
): Appointment[] {
  return appointments.filter((appointment) => appointment.date >= today);
}
