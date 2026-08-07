import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-appointments-header',
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-100"><ng-content /></h1>
      <button
        type="button"
        class="text-sm text-gray-300 bg-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        [disabled]="busy()"
        (click)="refresh.emit()"
      >
        Refresh
      </button>
    </div>
  `,
})
export class AppointmentsHeaderComponent {
  readonly busy = input(false);
  readonly refresh = output<void>();
}
