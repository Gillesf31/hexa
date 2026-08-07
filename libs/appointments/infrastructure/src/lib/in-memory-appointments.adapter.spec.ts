import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { Appointment } from '@hexa/appointments-domain';
import { InMemoryAppointmentsAdapter } from './in-memory-appointments.adapter';

describe('InMemoryAppointmentsAdapter', () => {
  it('emits its seeded appointments', async () => {
    const appointments = await firstValueFrom(new InMemoryAppointmentsAdapter().getAppointments());

    expect(appointments).toHaveLength(6);
    expect(appointments.map((appointment) => appointment.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
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

  it('spreads appointment dates around the current day', async () => {
    const adapter = new InMemoryAppointmentsAdapter(() => new Date('2026-08-07T12:00:00'));

    const appointments = await firstValueFrom(adapter.getAppointments());

    expect(appointments.map((appointment) => appointment.date)).toEqual([
      '2026-08-01',
      '2026-08-06',
      '2026-08-07',
      '2026-08-07',
      '2026-08-09',
      '2026-08-16',
    ]);
  });

  it('always emits appointments on or after today', async () => {
    const appointments = await firstValueFrom(new InMemoryAppointmentsAdapter().getAppointments());
    const today = new Date().toISOString().slice(0, 10);

    expect(appointments.some((appointment) => appointment.date >= today)).toBe(true);
  });
});
