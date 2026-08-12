import { describe, expect, it } from 'vitest';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ListedAppointment } from '@hexa/appointments-domain';
import { AppointmentListComponent } from './appointment-list.component';

const appointments: ListedAppointment[] = [
  {
    id: '1',
    customerName: 'Ada Lovelace',
    startsAt: new Date(2026, 7, 6, 9, 0),
    durationMinutes: 30,
    startingSoon: false,
  },
  {
    id: '2',
    customerName: 'Grace Hopper',
    startsAt: new Date(2026, 7, 7, 14, 0),
    durationMinutes: 60,
    startingSoon: false,
  },
];

function render(value: readonly ListedAppointment[]) {
  const fixture = TestBed.createComponent(AppointmentListComponent, {
    bindings: [inputBinding('appointments', signal(value))],
  });
  fixture.detectChanges();

  return fixture;
}

describe('AppointmentListComponent', () => {
  it('renders one card per appointment', () => {
    const fixture = render(appointments);

    const cards = fixture.nativeElement.querySelectorAll(
      'app-appointment-card',
    );
    expect(cards).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
    expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
  });

  it('shows an empty state when there is nothing to book', () => {
    const fixture = render([]);

    expect(
      fixture.nativeElement.querySelectorAll('app-appointment-card'),
    ).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain(
      'No appointments found.',
    );
  });
});
