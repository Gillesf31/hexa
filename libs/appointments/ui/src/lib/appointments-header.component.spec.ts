import { describe, expect, it, vi } from 'vitest';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppointmentsHeaderComponent } from './appointments-header.component';

function render(busy = signal(false), onRefresh = vi.fn()) {
  const fixture = TestBed.createComponent(AppointmentsHeaderComponent, {
    bindings: [inputBinding('busy', busy), outputBinding('refresh', onRefresh)],
  });
  fixture.detectChanges();

  return {
    fixture,
    onRefresh,
    button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
  };
}

describe('AppointmentsHeaderComponent', () => {
  it('emits refresh when the button is clicked', () => {
    const { button, onRefresh } = render();

    button.click();

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the button while busy', () => {
    const busy = signal(true);
    const { button, fixture } = render(busy);

    expect(button.disabled).toBe(true);

    busy.set(false);
    fixture.detectChanges();

    expect(button.disabled).toBe(false);
  });
});
