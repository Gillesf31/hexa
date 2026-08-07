import { describe, expect, it } from 'vitest';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Appointment } from '@hexa/appointments-domain';
import { AppointmentListComponent } from './appointment-list.component';

const appointments: Appointment[] = [
  {
    id: '1',
    customerName: 'Ada Lovelace',
    date: '2026-08-06',
    startTime: '09:00',
    durationMinutes: 30,
  },
  {
    id: '2',
    customerName: 'Grace Hopper',
    date: '2026-08-07',
    startTime: '14:00',
    durationMinutes: 60,
  },
];

function render(value: readonly Appointment[]) {
  const fixture = TestBed.createComponent(AppointmentListComponent, {
    bindings: [inputBinding('appointments', signal(value))],
  });
  fixture.detectChanges();

  return fixture;
}

describe('AppointmentListComponent', () => {
  it('renders one card per appointment', () => {
    const fixture = render(appointments);

    const cards = fixture.nativeElement.querySelectorAll('app-appointment-card');
    expect(cards).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
  });

  it('shows an empty state when there is nothing to book', () => {
    const fixture = render([]);

    expect(fixture.nativeElement.querySelectorAll('app-appointment-card')).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('No appointments found.');
  });
});
