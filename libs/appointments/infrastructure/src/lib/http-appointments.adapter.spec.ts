import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { HttpClient } from '@angular/common/http';
import type { Appointment } from '@hexa/appointments-domain';
import { HttpAppointmentsAdapter } from './http-appointments.adapter';

const appointments: Appointment[] = [
  { id: '1', customerName: 'Alice', date: '2026-08-05', startTime: '09:00', durationMinutes: 30 },
];

describe('HttpAppointmentsAdapter', () => {
  it('requests appointments from the json-server endpoint', async () => {
    const get = vi.fn().mockReturnValue(of(appointments));
    const adapter = new HttpAppointmentsAdapter({ get } as unknown as HttpClient);

    await firstValueFrom(adapter.getAppointments());

    expect(get).toHaveBeenCalledWith('http://localhost:3000/appointments');
  });

  it('passes the response through untouched', async () => {
    const get = vi.fn().mockReturnValue(of(appointments));
    const adapter = new HttpAppointmentsAdapter({ get } as unknown as HttpClient);

    expect(await firstValueFrom(adapter.getAppointments())).toEqual(appointments);
  });
});
