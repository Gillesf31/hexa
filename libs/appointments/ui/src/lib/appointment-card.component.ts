import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  isReroutedToAnotherAdvisor,
  type ListedAppointment,
} from '@hexa/appointments-domain';

@Component({
  selector: 'app-appointment-card',
  imports: [DatePipe],
  template: `
    <div
      class="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-lg font-semibold text-gray-100">{{
          appointment().customerName
        }}</span>
        <span class="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-full"
          >{{ appointment().durationMinutes }} min</span
        >
      </div>
      <div class="flex gap-4 text-sm text-gray-400">
        <span>📅 {{ appointment().startsAt | date: 'yyyy-MM-dd' }}</span>
        <span>🕐 {{ appointment().startsAt | date: 'HH:mm' }}</span>
      </div>
      @if (isRerouted()) {
        <p class="mt-3 text-xs text-amber-300">
          ↪️ Re-routed to another advisor
        </p>
      }
      @if (appointment().startingSoon) {
        <p class="mt-1 text-xs text-sky-300">⏳ Starting soon</p>
      }
    </div>
  `,
})
export class AppointmentCardComponent {
  readonly appointment = input.required<ListedAppointment>();

  readonly isRerouted = computed(() =>
    isReroutedToAnotherAdvisor(this.appointment()),
  );
}
