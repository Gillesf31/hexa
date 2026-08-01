export type Appointment = {
  id: string;
  customerName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
};

// Business rule: only appointments dated today or in the future should be shown.
// This is a pure function with no side effects — the caller provides "today"
// so the domain never depends on the system clock.
export function filterPastAppointments(
  appointments: Appointment[],
  today: string
): Appointment[] {
  return appointments.filter((a) => a.date >= today);
}
