import { Component, computed, input } from '@angular/core';

export type StatusMessageVariant = 'info' | 'error';

@Component({
  selector: 'app-status-message',
  template: `
    <p class="text-center py-8" [class]="toneClass()" [attr.role]="role()">
      <ng-content />
    </p>
  `,
})
export class StatusMessageComponent {
  readonly variant = input<StatusMessageVariant>('info');

  protected readonly toneClass = computed(() =>
    this.variant() === 'error' ? 'text-red-400' : 'text-gray-500'
  );

  protected readonly role = computed(() => (this.variant() === 'error' ? 'alert' : 'status'));
}
