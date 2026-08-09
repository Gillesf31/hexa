// Writes `server/db.json` from `server/db.seed.json`, turning each record's
// `dayOffset` into the absolute `date` the API is contractually required to
// serve. The seam matters: the *contract* keeps `date` and `startTime` exactly
// as another team defined them, while the *rows* are fixtures that may be
// reseeded — see the rule in CLAUDE.md.
//
// A fixed date in a checked-in fixture rots against a domain rule that filters
// on today, which is how `serve` came to render an empty list while
// `serve-memory` kept working: the in-memory adapter had always stored offsets.
//
// It also writes the Bruno environment, deriving the dates those requests filter
// on from this same seed, so the collection cannot drift away from the data the
// way it silently did before.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(serverDir, '..');
const brunoEnvironment = join(
  repoRoot,
  'bruno',
  'appointment-booking-api',
  'environments',
  'Local.bru'
);

const BASE_URL = 'http://localhost:3000';

// Local components, never `toISOString()`: that converts to UTC and can land on
// the previous day, which is the same class of bug as the adapter's rollover.
function toIsoDate(dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

function countByDayOffset(appointments) {
  const counts = new Map();

  for (const { dayOffset } of appointments) {
    counts.set(dayOffset, (counts.get(dayOffset) ?? 0) + 1);
  }

  return counts;
}

// Fails loudly rather than writing an environment that would make a Bruno
// request answer with nothing. A request returning an empty list because the
// fixtures moved is a broken document, not a passing test.
function findDayWith(counts, wanted, description) {
  const matching = [...counts.entries()]
    .filter(([, count]) => count === wanted)
    .map(([dayOffset]) => dayOffset)
    .sort((a, b) => a - b);

  // Today or later when possible, so the day Bruno filters on is also a day the
  // app displays. Past fixtures exist to prove the domain rule drops them.
  const upcoming = matching.filter((dayOffset) => dayOffset >= 0);
  const offsets = upcoming.length > 0 ? upcoming : matching;

  if (offsets.length === 0) {
    throw new Error(
      `server/db.seed.json has no day with ${description}. The Bruno collection ` +
        `filters on one, so seeding would leave that request describing an API ` +
        `that no longer answers the way it claims.`
    );
  }

  return offsets[0];
}

const seed = JSON.parse(readFileSync(join(serverDir, 'db.seed.json'), 'utf8'));

const appointments = seed.appointments.map(({ dayOffset, ...appointment }) => ({
  id: appointment.id,
  customerName: appointment.customerName,
  date: toIsoDate(dayOffset),
  startTime: appointment.startTime,
  durationMinutes: appointment.durationMinutes,
}));

writeFileSync(
  join(serverDir, 'db.json'),
  `${JSON.stringify(
    { appointments, $schema: './node_modules/json-server/schema.json' },
    null,
    2
  )}\n`
);

const counts = countByDayOffset(seed.appointments);
const latestDayOffset = Math.max(...seed.appointments.map(({ dayOffset }) => dayOffset));

const variables = {
  baseUrl: BASE_URL,
  singleMatchDate: toIsoDate(findDayWith(counts, 1, 'exactly one appointment')),
  multiMatchDate: toIsoDate(findDayWith(counts, 2, 'exactly two appointments')),
  createDate: toIsoDate(latestDayOffset + 1),
};

const lines = Object.entries(variables).map(([name, value]) => `  ${name}: ${value}`);

writeFileSync(brunoEnvironment, `vars {\n${lines.join('\n')}\n}\n`);

console.log(
  `Seeded ${appointments.length} appointments from db.seed.json ` +
    `(${variables.singleMatchDate} has one, ${variables.multiMatchDate} has two).`
);
