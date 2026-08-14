import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { filter, firstValueFrom, take } from 'rxjs';
import {
  appointmentsFeature,
  appointmentsPageActions,
} from '@hexa/appointments-state';
import { provideAppointmentsShell } from './provide-appointments-shell';

describe('provideAppointmentsShell', () => {
  it('runs the effect with the adapters selected by the shell', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideAppointmentsShell({
          dataSource: 'memory',
          apiBaseUrl: 'http://unused.example',
        }),
      ],
    });

    const store = TestBed.inject(Store);
    const loadedAppointments = firstValueFrom(
      store.select(appointmentsFeature.selectAppointments).pipe(
        filter((appointments) => appointments.length === 5),
        take(1),
      ),
    );

    store.dispatch(appointmentsPageActions.opened());

    expect(await loadedAppointments).toHaveLength(5);
  });
});
