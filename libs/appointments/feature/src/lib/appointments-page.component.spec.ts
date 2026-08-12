import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { Action } from '@ngrx/store';
import { provideState, provideStore, Store } from '@ngrx/store';
import type { ListedAppointment } from '@hexa/appointments-domain';
import {
  appointmentsApiActions,
  appointmentsFeature,
  appointmentsPageActions,
} from '@hexa/appointments-state';
import { AppointmentsPageComponent } from './appointments-page.component';

// What the store holds is what the use case handed back: the appointment plus
// what the list says about it.
const appointments: ListedAppointment[] = [
  {
    id: '1',
    customerName: 'Ada Lovelace',
    startsAt: new Date(2026, 7, 6, 9, 0),
    durationMinutes: 60,
    startingSoon: false,
  },
];

// The real reducer, so a component reading the wrong selector fails here rather
// than agreeing with a fake. No effects: `opened()` reaches the store and stops.
function render() {
  TestBed.configureTestingModule({
    providers: [provideStore(), provideState(appointmentsFeature)],
  });

  const store = TestBed.inject(Store);
  const dispatch = vi.spyOn(store, 'dispatch');
  const fixture = TestBed.createComponent(AppointmentsPageComponent);
  fixture.detectChanges();

  return {
    dispatch,
    text: () => fixture.nativeElement.textContent as string,
    list: () => fixture.nativeElement.querySelector('app-appointment-list'),
    refreshButton: () =>
      fixture.nativeElement.querySelector('button') as HTMLButtonElement,
    settle: (action: Action) => {
      store.dispatch(action);
      fixture.detectChanges();
    },
  };
}

const loaded = appointmentsApiActions.loadedSuccess({ appointments });
const failed = appointmentsApiActions.loadedFailure({
  message: 'Appointments could not be loaded.',
});

describe('AppointmentsPageComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('asks for the appointments when the page opens', () => {
    const { dispatch } = render();

    // Nothing else starts the first load: the effect only listens for
    // `opened` and `refreshed`.
    expect(dispatch).toHaveBeenCalledWith(appointmentsPageActions.opened());
  });

  it('asks for them again when Refresh is clicked', () => {
    const { dispatch, refreshButton, settle } = render();
    settle(loaded);
    dispatch.mockClear();

    // Through the DOM, so the `(refresh)` binding is under test and not just
    // the method body.
    refreshButton().click();

    expect(dispatch).toHaveBeenCalledWith(appointmentsPageActions.refreshed());
  });

  it('shows the loading message and no list while the request is in flight', () => {
    const { text, list } = render();

    expect(text()).toContain('Loading appointments…');
    expect(list()).toBeNull();
  });

  it('renders the list once the appointments arrive', () => {
    const { text, list, settle } = render();

    settle(loaded);

    expect(list()).not.toBeNull();
    expect(text()).toContain('Ada Lovelace');
    expect(text()).not.toContain('Loading appointments…');
  });

  it('shows the failure instead of the list when the load fails', () => {
    const { text, list, settle } = render();

    settle(failed);

    expect(text()).toContain('Appointments could not be loaded.');
    expect(list()).toBeNull();
  });

  it('disables Refresh while loading, so it cannot be pressed twice', () => {
    const { refreshButton, settle } = render();

    expect(refreshButton().disabled).toBe(true);

    settle(loaded);

    expect(refreshButton().disabled).toBe(false);
  });
});
