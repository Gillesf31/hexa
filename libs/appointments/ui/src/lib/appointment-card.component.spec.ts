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

describe('AppointmentCardComponent', () => {
  it('renders the appointment details', () => {
    const fixture = TestBed.createComponent(AppointmentCardComponent, {
      bindings: [inputBinding('appointment', signal(appointment))],
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ada Lovelace');
    expect(text).toContain('30 min');
    expect(text).toContain('2026-08-06');
    expect(text).toContain('09:00');
  });
});
