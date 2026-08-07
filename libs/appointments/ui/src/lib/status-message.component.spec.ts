import { describe, expect, it } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatusMessageComponent } from './status-message.component';

@Component({
  imports: [StatusMessageComponent],
  template: `
    <app-status-message>Loading appointments…</app-status-message>
    <app-status-message variant="error">Something went wrong.</app-status-message>
  `,
})
class HostComponent {}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();

  return fixture.nativeElement.querySelectorAll('p') as NodeListOf<HTMLParagraphElement>;
}

describe('StatusMessageComponent', () => {
  it('projects the message', () => {
    const [info, error] = render();

    expect(info.textContent?.trim()).toBe('Loading appointments…');
    expect(error.textContent?.trim()).toBe('Something went wrong.');
  });

  it('announces informational messages politely', () => {
    const [info] = render();

    expect(info.getAttribute('role')).toBe('status');
    expect(info.className).toContain('text-gray-500');
  });

  it('announces errors assertively', () => {
    const [, error] = render();

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.className).toContain('text-red-400');
  });
});
