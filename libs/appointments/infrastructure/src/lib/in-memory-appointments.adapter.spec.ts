import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import { InMemoryAppointmentsAdapter } from './in-memory-appointments.adapter';

describe('InMemoryAppointmentsAdapter', () => {
  it('emits its seeded appointments', async () => {
    const appointments = await firstValueFrom(new InMemoryAppointmentsAdapter().getAppointments());

    expect(appointments).toHaveLength(5);
    expect(appointments.map((appointment) => appointment.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('emits appointments that satisfy the Appointment contract', async () => {
    const appointments = await firstValueFrom(new InMemoryAppointmentsAdapter().getAppointments());

    appointments.forEach((appointment: Appointment) => {
      expect(appointment.id).toBeTruthy();
      expect(appointment.customerName).toBeTruthy();
      expect(appointment.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(appointment.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(appointment.durationMinutes).toBeGreaterThan(0);
    });
  });
});
