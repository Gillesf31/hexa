import { describe, expect, it } from 'vitest';
import { filterPastAppointments } from './appointment.model';
import type { Appointment } from './appointment.model';

const mockAppointments: Appointment[] = [
  { id: '1', customerName: 'Past', date: '2026-07-29', startTime: '09:00', durationMinutes: 60 },
  { id: '2', customerName: 'Today', date: '2026-07-31', startTime: '10:00', durationMinutes: 45 },
  { id: '3', customerName: 'Future', date: '2026-08-05', startTime: '14:00', durationMinutes: 30 },
];

describe('filterPastAppointments', () => {
  it('excludes appointments before today', () => {
    expect(filterPastAppointments(mockAppointments, '2026-07-31').map((appointment) => appointment.id)).toEqual(['2', '3']);
  });

  it('keeps all appointments when all are in the future', () => {
    expect(filterPastAppointments(mockAppointments, '2026-07-01')).toHaveLength(3);
  });

  it('returns empty when all appointments are in the past', () => {
    expect(filterPastAppointments(mockAppointments, '2026-09-01')).toEqual([]);
  });

  it('returns empty for an empty list', () => {
    expect(filterPastAppointments([], '2026-07-31')).toEqual([]);
  });
});
