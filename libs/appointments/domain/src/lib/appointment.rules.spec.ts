import { describe, expect, it } from 'vitest';
import {
  filterAppointmentsWithCustomerName,
  filterCurrentAndFutureAppointments,
} from './appointment.rules';
import type { Appointment } from './appointment';

describe('filterCurrentAndFutureAppointments', () => {
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      customerName: 'Past',
      date: '2026-07-29',
      startTime: '09:00',
      durationMinutes: 60,
    },
    {
      id: '2',
      customerName: 'Today',
      date: '2026-07-31',
      startTime: '10:00',
      durationMinutes: 45,
    },
    {
      id: '3',
      customerName: 'Future',
      date: '2026-08-05',
      startTime: '14:00',
      durationMinutes: 30,
    },
  ];

  it('keeps appointments on or after today', () => {
    expect(
      filterCurrentAndFutureAppointments(mockAppointments, '2026-07-31').map(
        (appointment) => appointment.id
      )
    ).toEqual(['2', '3']);
  });

  it('keeps every appointment when today is before all appointments', () => {
    expect(filterCurrentAndFutureAppointments(mockAppointments, '2026-07-01')).toHaveLength(3);
  });

  it('returns no appointments when today is after all appointments', () => {
    expect(filterCurrentAndFutureAppointments(mockAppointments, '2026-09-01')).toEqual([]);
  });

  it('returns no appointments when none are supplied', () => {
    expect(filterCurrentAndFutureAppointments([], '2026-07-31')).toEqual([]);
  });
});

describe('filterAppointmentsWithCustomerName', () => {
  it('should exclude an appointment when its customer name is empty', () => {
    const appointment: Appointment = {
      id: '4',
      customerName: '',
      date: '2026-07-31',
      startTime: '16:00',
      durationMinutes: 30,
    };

    expect(filterAppointmentsWithCustomerName([appointment])).toEqual([]);
  });

  it('should exclude an appointment when its customer name contains only whitespace', () => {
    const appointment: Appointment = {
      id: '5',
      customerName: '   ',
      date: '2026-08-05',
      startTime: '16:00',
      durationMinutes: 30,
    };

    expect(filterAppointmentsWithCustomerName([appointment])).toEqual([]);
  });

  it('should keep appointments when customer names contain text with or without surrounding whitespace', () => {
    const appointments: Appointment[] = [
      {
        id: '6',
        customerName: 'Alice',
        date: '2026-07-31',
        startTime: '09:00',
        durationMinutes: 30,
      },
      {
        id: '7',
        customerName: '  Alice  ',
        date: '2026-08-05',
        startTime: '10:00',
        durationMinutes: 30,
      },
    ];

    expect(filterAppointmentsWithCustomerName(appointments).map((appointment) => appointment.id)).toEqual([
      '6',
      '7',
    ]);
  });
});
