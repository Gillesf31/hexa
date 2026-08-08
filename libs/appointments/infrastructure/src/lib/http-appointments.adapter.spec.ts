import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { HttpClient } from '@angular/common/http';
import { HttpAppointmentsAdapter } from './http-appointments.adapter';

const apiResponse = [
  { id: '1', customerName: 'Alice', date: '2026-08-05', startTime: '09:00', durationMinutes: 30 },
];

describe('HttpAppointmentsAdapter', () => {
  it('requests appointments from the json-server endpoint', async () => {
    const get = vi.fn().mockReturnValue(of(apiResponse));
    const adapter = new HttpAppointmentsAdapter({ get } as unknown as HttpClient);

    await firstValueFrom(adapter.getAppointments());

    expect(get).toHaveBeenCalledWith('http://localhost:3000/appointments');
  });

  it('maps each API resource onto a domain appointment', async () => {
    const get = vi.fn().mockReturnValue(of(apiResponse));
    const adapter = new HttpAppointmentsAdapter({ get } as unknown as HttpClient);

    expect(await firstValueFrom(adapter.getAppointments())).toEqual([
      { id: '1', customerName: 'Alice', date: '2026-08-05', startTime: '09:00', durationMinutes: 30 },
    ]);
  });

  it('keeps fields the domain does not know about out of the result', async () => {
    const get = vi.fn().mockReturnValue(
      of([{ ...apiResponse[0], createdAt: '2026-08-01T09:00:00Z', internalNotes: 'vendor field' }])
    );
    const adapter = new HttpAppointmentsAdapter({ get } as unknown as HttpClient);

    const [appointment] = await firstValueFrom(adapter.getAppointments());

    expect(Object.keys(appointment).sort()).toEqual([
      'customerName',
      'date',
      'durationMinutes',
      'id',
      'startTime',
    ]);
  });
});
