import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import type { HttpClient } from '@angular/common/http';
import { HttpAppointmentsAdapter } from './http-appointments.adapter';

const apiResponse = [
  { id: '1', customerName: 'Alice', date: '2026-08-05', startTime: '09:00', durationMinutes: 30 },
];

function adapterReturning(payload: unknown, apiBaseUrl = 'http://localhost:3000') {
  const get = vi.fn().mockReturnValue(of(payload));

  return {
    get,
    adapter: new HttpAppointmentsAdapter({ get } as unknown as HttpClient, apiBaseUrl),
  };
}

describe('HttpAppointmentsAdapter', () => {
  it('builds its endpoint from the base URL it was given', async () => {
    const { get, adapter } = adapterReturning(apiResponse, 'https://api.example.test');

    await firstValueFrom(adapter.getAppointments());

    expect(get).toHaveBeenCalledWith('https://api.example.test/appointments');
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

  describe('when the API breaks its contract', () => {
    it('refuses a body that is not a list', async () => {
      const { adapter } = adapterReturning({ error: 'Internal Server Error' });

      await expect(firstValueFrom(adapter.getAppointments())).rejects.toThrow(
        'the body is not an array'
      );
    });

    it('refuses a record whose field has the wrong type, naming the entry', async () => {
      const { adapter } = adapterReturning([apiResponse[0], { ...apiResponse[0], customerName: null }]);

      await expect(firstValueFrom(adapter.getAppointments())).rejects.toThrow(
        'entry 1: customerName must be a string'
      );
    });

    // Without this the string parses, `new Date` rolls month 13 over into the
    // next year, and a wrong instant renders as if it were fact.
    it('refuses a date that is well formed but names no real instant', async () => {
      const { adapter } = adapterReturning([{ ...apiResponse[0], date: '2026-13-45' }]);

      await expect(firstValueFrom(adapter.getAppointments())).rejects.toThrow(
        'names no real instant (2026-13-45 09:00)'
      );
    });

    // The boundary checks types, the domain decides meaning. An empty name is a
    // valid string, so it must survive to reach filterAppointmentsWithCustomerName.
    it('accepts an empty customer name and leaves that judgement to the domain', async () => {
      const { adapter } = adapterReturning([{ ...apiResponse[0], customerName: '' }]);

      const [appointment] = await firstValueFrom(adapter.getAppointments());

      expect(appointment.customerName).toBe('');
    });
  });
});
