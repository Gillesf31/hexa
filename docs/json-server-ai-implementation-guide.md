# AI Implementation Guide — Appointment Booking JSON Server

## Mission

Add the smallest useful JSON Server backend for the appointment-booking exercise described in [Appointment Booking — Business Requirements](./appointment-booking-business-requirements.md).

Implement only the storage-facing HTTP API. Do not implement the Angular feature, the booking use case, or either booking rule.

## Behavioral boundary

The server is a simple appointment record store.

It must:

- return appointments;
- filter appointments by exact date;
- create and persist an appointment;
- retain created appointments while using the same database file.

It must not:

- decide whether a time is within opening hours;
- detect appointment conflicts;
- reject overlapping appointments;
- calculate availability;
- expose a custom “book” or “check availability” operation;
- contain Angular-specific files or types.

Those decisions belong to the application consuming this API.

## Before making changes

1. Inspect the repository structure and all applicable repository instructions.
2. Identify the existing package manager from the manifest and lockfile. Do not introduce a second package manager.
3. Check whether JSON Server or an equivalent development server is already configured.
4. Preserve unrelated work and follow existing naming and formatting conventions.
5. Prefer the repository's current Node runtime and scripts unless they cannot run JSON Server.

## Required deliverables

Add:

1. JSON Server as a development dependency.
2. A database file containing an `appointments` array.
3. A package script that starts the API on `http://localhost:3000`.
4. The seed appointments specified below.
5. A short repository-facing note explaining how to start and reset the demo data, if the existing project documentation has an appropriate place for it.
6. The package-manager lockfile update produced by the installation.

Use `server/db.json` for the database unless the repository already has a clear convention for mock-server files. If a different location is selected, keep the start script and documentation consistent with it.

Use a short script name such as `api` unless that name already exists or conflicts with repository conventions.

## JSON Server compatibility

Follow the [current official JSON Server documentation](https://github.com/typicode/json-server). The current official README describes the v1 beta behavior, including string identifiers, equality filters, array-resource routes, and automatic identifiers on creation.

- Use the JSON Server version resolved by the repository's package manager and pin it through the manifest and lockfile.
- Do not copy commands or query syntax from old v0 tutorials without checking them against the installed version.
- Run the installed executable through the package script rather than relying on a globally installed package.
- If an option is uncertain, confirm it with the installed executable's help output.

## Resource and record contract

Create one top-level array resource named `appointments`.

Each appointment record has exactly these fields:

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `id` | string | Present on stored records | Storage identifier | `"1"` |
| `customerName` | string | Yes | Name supplied for the appointment | `"Sample Customer"` |
| `date` | string | Yes | Local calendar date in `YYYY-MM-DD` form | `"2026-08-03"` |
| `startTime` | string | Yes | Local 24-hour time in `HH:mm` form | `"10:00"` |
| `durationMinutes` | number | Yes | Appointment duration | `60` |

Do not store JavaScript date strings, timestamps, time-zone offsets, calculated end times, availability flags, or conflict flags.

The client owns the interpretation of the date and time. The server stores the supplied values unchanged.

## Seed data

Seed the database with these two records:

| ID | Customer name | Date | Start time | Duration |
|---|---|---|---|---|
| `1` | Sample Customer | 2026-08-03 | 10:00 | 60 minutes |
| `2` | Another Customer | 2026-08-04 | 14:00 | 60 minutes |

The second date is intentional: it allows the date-filter behavior to be verified.

Do not include real personal information.

## Required HTTP behavior

### List every appointment

- Request: `GET /appointments`
- Expected response: an array containing every stored appointment.

### List appointments for one date

- Request: `GET /appointments?date=2026-08-03`
- Expected response: an array containing only records whose `date` exactly equals `2026-08-03`.
- With the original seed data, the response contains only record `1`.

Use JSON Server's normal equality-filter behavior. Do not implement a custom route or middleware for this query.

### Create an appointment

- Request: `POST /appointments`
- Request body contains `customerName`, `date`, `startTime`, and `durationMinutes`.
- The client may omit `id`; JSON Server should generate it according to the installed version's normal behavior.
- Expected response: a successful JSON response containing the stored appointment and its identifier.
- A later GET request must return the created record.

No update or delete operation is needed by the Angular exercise, even if JSON Server exposes its standard generated routes.

## Implementation constraints

- Prefer zero custom server code.
- Do not add Express, custom middleware, controllers, services, a database library, or request-validation packages.
- Do not create a custom API prefix unless the existing repository requires one.
- Do not add authentication, artificial delays, error simulation, pagination, sorting, or relationships.
- Do not add opening-hours configuration to the database.
- Do not add an availability endpoint.
- Do not put domain decisions in package scripts or seed-generation logic.
- Keep the change easy to understand and recreate during a live-coding session.

## Demo-data reset

JSON Server persists successful writes into its database file. Ensure the final instructions tell the presenter how to restore the two original seed records before repeating the demonstration.

Prefer the simplest approach compatible with the repository. Do not introduce a custom reset program unless the repository already uses that pattern or resetting by restoring the seed file would be error-prone.

## Verification procedure

After implementation, perform all of these checks:

1. Install dependencies successfully using the repository's package manager.
2. Start the new package script and confirm the server listens on port `3000`.
3. Request all appointments and confirm both seed records are returned.
4. Filter by `2026-08-03` and confirm only the 10:00 record is returned.
5. Filter by `2026-08-04` and confirm only the 14:00 record is returned.
6. Filter by a date with no records and confirm an empty array is returned.
7. Create a new appointment using the required four writable fields.
8. Confirm the response contains a generated string identifier.
9. Request the new appointment's date and confirm the new record is returned.
10. Restart JSON Server and confirm the created record remains available.
11. Restore the original seed state after verification so the live demo starts predictably.
12. Run any existing lightweight repository checks affected by the manifest or configuration change.

If starting a long-running server is necessary for verification, stop it after the checks are complete.

## Acceptance checklist

The task is complete only when:

- one command starts the API;
- the API starts on `http://localhost:3000`;
- the `appointments` collection contains the two seed records;
- exact-date filtering works through a query parameter;
- POST creates and persists a record;
- record identifiers are strings;
- the database contains no business decisions or derived availability data;
- no custom backend logic was added unnecessarily;
- the demo can be reset to its original data;
- the implementation and start instructions match the repository's package manager.

## Final response expected from the coding AI

Report:

1. the files changed;
2. the command that starts JSON Server;
3. the base URL and supported routes used by the exercise;
4. the verification performed and its result;
5. the exact method for restoring the seed data;
6. any repository-specific decision that differs from this guide and why.

Do not claim completion if the API was not started and exercised successfully.
