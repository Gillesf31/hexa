export type Appointment = {
  id: string;
  customerName: string;
  startsAt: Date;
  durationMinutes: number;
};

// An appointment as the list shows it: the appointment itself, plus what the
// list says about it. The flag is not on `Appointment` because an appointment
// coming out of the API has no opinion about imminence — it is derived, and it
// depends on when you look.
export type ListedAppointment = Appointment & {
  startingSoon: boolean;
};
