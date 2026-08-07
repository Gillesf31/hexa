import { Component, input } from '@angular/core';
import type { Appointment } from '@hexa/appointments-domain';

@Component({
  selector: 'app-appointment-card',
  template: `
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div class="flex justify-between items-center mb-2">
        <span class="text-lg font-semibold text-gray-100">{{ appointment().customerName }}</span>
        <span class="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-full">{{ appointment().durationMinutes }} min</span>
      </div>
      <div class="flex gap-4 text-sm text-gray-400">
        <span>📅 {{ appointment().date }}</span>
        <span>🕐 {{ appointment().startTime }}</span>
      </div>
    </div>
  `,
})
export class AppointmentCardComponent {
  readonly appointment = input.required<Appointment>();
}
