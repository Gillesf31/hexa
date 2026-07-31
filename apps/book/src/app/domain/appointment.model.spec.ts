import { describe, it, expect } from 'vitest';
import {
  Appointment,
  filterPastAppointments,
} from './appointment.model';

const mockAppointments: Appointment[] = [
  { id: 1, customerName: 'Past',   date: '2026-07-29', startTime: '09:00', durationMinutes: 60 },
  { id: 2, customerName: 'Today',  date: '2026-07-31', startTime: '10:00', durationMinutes: 45 },
  { id: 3, customerName: 'Future', date: '2026-08-05', startTime: '14:00', durationMinutes: 30 },
];

describe('filterPastAppointments', () => {
  it('should exclude appointments before today', () => {
    const result = filterPastAppointments(mockAppointments, '2026-07-31');
    expect(result.map((a) => a.id)).toEqual([2, 3]);
  });

  it('should keep all appointments when all are in the future', () => {
    const result = filterPastAppointments(mockAppointments, '2026-07-01');
    expect(result).toHaveLength(3);
  });

  it('should return empty when all appointments are in the past', () => {
    const result = filterPastAppointments(mockAppointments, '2026-09-01');
    expect(result).toHaveLength(0);
  });

  it('should return empty for an empty list', () => {
    const result = filterPastAppointments([], '2026-07-31');
    expect(result).toEqual([]);
  });
});
