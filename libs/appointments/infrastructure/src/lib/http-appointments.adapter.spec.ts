import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { HttpClient } from '@angular/common/http';
import { HttpAppointmentsAdapter } from './http-appointments.adapter';

const apiResponse = [
  { id: '1', customerName: 'Alice', date: '2026-08-05', startTime: '09:00', durationMinutes: 30 },
];

function adapterReturning(payload: unknown) {
  const get = vi.fn().mockReturnValue(of(payload));

  return { get, adapter: new HttpAppointmentsAdapter({ get } as unknown as HttpClient) };
}

describe('HttpAppointmentsAdapter', () => {
  it('requests appointments from the json-server endpoint', async () => {
    const { get, adapter } = adapterReturning(apiResponse);

    await firstValueFrom(adapter.getAppointments());

    expect(get).toHaveBeenCalledWith('http://localhost:3000/appointments');
  });

  it('folds the API date and start time into a single instant', async () => {
    const { adapter } = adapterReturning(apiResponse);

    expect(await firstValueFrom(adapter.getAppointments())).toEqual([
      { id: '1', customerName: 'Alice', startsAt: new Date(2026, 7, 5, 9, 0), durationMinutes: 30 },
    ]);
  });

  it('keeps fields the domain does not know about out of the result', async () => {
    const { adapter } = adapterReturning([
      { ...apiResponse[0], createdAt: '2026-08-01T09:00:00Z', internalNotes: 'vendor field' },
    ]);

    const [appointment] = await firstValueFrom(adapter.getAppointments());

    expect(Object.keys(appointment).sort()).toEqual([
      'customerName',
      'durationMinutes',
      'id',
      'startsAt',
    ]);
  });
});
