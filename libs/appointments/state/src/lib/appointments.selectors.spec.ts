import { describe, expect, it } from 'vitest';
import {
  selectAppointmentsErrorMessage,
  selectIsLoadingAppointments,
} from './appointments.selectors';

describe('selectIsLoadingAppointments', () => {
  it('is true only while loading', () => {
    expect(selectIsLoadingAppointments.projector('loading')).toBe(true);
    expect(selectIsLoadingAppointments.projector('idle')).toBe(false);
    expect(selectIsLoadingAppointments.projector('loaded')).toBe(false);
    expect(selectIsLoadingAppointments.projector('failed')).toBe(false);
  });
});

describe('selectAppointmentsErrorMessage', () => {
  it('exposes the message when the last load failed', () => {
    expect(
      selectAppointmentsErrorMessage.projector('failed', 'API unreachable'),
    ).toBe('API unreachable');
  });

  it('hides a stale message once loading starts again', () => {
    expect(
      selectAppointmentsErrorMessage.projector('loading', 'API unreachable'),
    ).toBeNull();
  });

  it('returns nothing when the appointments loaded', () => {
    expect(selectAppointmentsErrorMessage.projector('loaded', null)).toBeNull();
  });
});
