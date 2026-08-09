import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import * as z from 'zod/mini';
import type { Appointment } from '@hexa/appointments-domain';
import type { AppointmentsPort } from '@hexa/appointments-ports';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

// The API's shape, not the domain's, and executable rather than declared:
// asking `http.get` for a DTO type would be a claim nothing checks at runtime.
// `z.number()` already rejects NaN and Infinity, so no extra check is needed.
// Structure only — an empty customerName is a valid string and passes here. That
// an appointment without a name is not worth showing is a domain decision, and
// `filterAppointmentsWithCustomerName` is where it is made.
const appointmentDtoSchema = z.object({
  id: z.string({ error: 'must be a string' }),
  customerName: z.string({ error: 'must be a string' }),
  date: z
    .string({ error: 'must look like YYYY-MM-DD' })
    .check(z.regex(DATE_PATTERN, { error: 'must look like YYYY-MM-DD' })),
  startTime: z
    .string({ error: 'must look like HH:MM' })
    .check(z.regex(TIME_PATTERN, { error: 'must look like HH:MM' })),
  durationMinutes: z.number({ error: 'must be a number' }),
});

const appointmentsPayloadSchema = z.array(appointmentDtoSchema, {
  error: 'the body is not an array',
});

// One declaration, so the contract and the check cannot drift apart. Unknown
// keys are dropped, which is why nothing the vendor adds reaches the domain.
type AppointmentDto = z.infer<typeof appointmentDtoSchema>;

class MalformedPayloadError extends Error {
  constructor(fault: string) {
    super(`The appointments API returned an unusable payload: ${fault}.`);
    this.name = 'MalformedPayloadError';
  }
}

function describeIssue({ path, message }: z.core.$ZodIssue): string {
  const [index, ...rest] = path;

  if (index === undefined) return message;

  // Zod types a path segment as a PropertyKey, so a symbol key is possible here
  // even though a JSON body can never produce one.
  const entry = String(index);
  const field = rest.map(String).join('.');

  return field
    ? `entry ${entry}: ${field} ${message}`
    : `entry ${entry} ${message}`;
}

// The API splits an appointment's start across two strings; the domain wants the
// single instant those two describe. This is the whole reason the seam exists.
function toStartsAt(date: string, startTime: string): Date | null {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const startsAt = new Date(year, month - 1, day, hours, minutes);

  // Left to the schema this would pass: the pattern only proves the digits are
  // in the right places. `new Date` then rolls over rather than refusing — month
  // 13 becomes January of the next year, a two-digit year becomes 19xx — so the
  // parts have to be read back to know the string named the instant it claimed.
  const describesTheSameInstant =
    startsAt.getFullYear() === year &&
    startsAt.getMonth() === month - 1 &&
    startsAt.getDate() === day &&
    startsAt.getHours() === hours &&
    startsAt.getMinutes() === minutes;

  return describesTheSameInstant ? startsAt : null;
}

function toAppointment(dto: AppointmentDto, index: number): Appointment {
  const startsAt = toStartsAt(dto.date, dto.startTime);

  if (startsAt === null) {
    throw new MalformedPayloadError(
      `entry ${index} names no real instant (${dto.date} ${dto.startTime})`,
    );
  }

  return {
    id: dto.id,
    customerName: dto.customerName,
    startsAt,
    durationMinutes: dto.durationMinutes,
  };
}

// One bad record fails the batch. Skipping it would be the silent data loss this
// boundary exists to prevent: the effect already turns a thrown error into a
// message on screen, which is the honest outcome for a broken contract.
function toAppointments(payload: unknown): Appointment[] {
  const result = appointmentsPayloadSchema.safeParse(payload);

  if (!result.success) {
    throw new MalformedPayloadError(
      result.error.issues.map(describeIssue).join('; '),
    );
  }

  return result.data.map(toAppointment);
}

export class HttpAppointmentsAdapter implements AppointmentsPort {
  constructor(
    private readonly http: HttpClient,
    private readonly apiBaseUrl: string,
  ) {}

  getAppointments = () =>
    this.http
      .get<unknown>(`${this.apiBaseUrl}/appointments`)
      .pipe(map(toAppointments));
}
