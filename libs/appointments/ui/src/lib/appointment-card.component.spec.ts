import { describe, expect, it } from 'vitest';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Appointment } from '@hexa/appointments-domain';
import { AppointmentCardComponent } from './appointment-card.component';

const appointment: Appointment = {
  id: '1',
  customerName: 'Ada Lovelace',
  startsAt: new Date(2026, 7, 6, 9, 0),
  durationMinutes: 30,
};

function render(value: Appointment) {
  const fixture = TestBed.createComponent(AppointmentCardComponent, {
    bindings: [inputBinding('appointment', signal(value))],
  });
  fixture.detectChanges();

  return fixture;
}

describe('AppointmentCardComponent', () => {
  it('renders the appointment details', () => {
    const text = render(appointment).nativeElement.textContent;

    expect(text).toContain('Ada Lovelace');
    expect(text).toContain('30 min');
    expect(text).toContain('2026-08-06');
    expect(text).toContain('09:00');
  });

  it('announces that a half-hour appointment is re-routed', () => {
    const text = render(appointment).nativeElement.textContent;

    expect(text).toContain('Re-routed to another advisor');
  });

  // The negative case is the one that catches a notice wired to always show.
  it('says nothing about re-routing a longer appointment', () => {
    const text = render({ ...appointment, durationMinutes: 60 }).nativeElement
      .textContent;

    expect(text).not.toContain('Re-routed');
  });
});
