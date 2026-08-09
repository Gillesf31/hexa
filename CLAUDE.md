# hexa

An appointment-booking exercise whose deliverable is the _structure_, not the
feature. Three small business rules sit behind eight Nx libraries, and that ratio
is deliberate — advice that would be right on a product ("this is over-built for
what it does") is usually wrong here. What is genuinely under review is whether
the second feature reuses `domain`, `ports` and `application` as they stand.

## The API is not ours to bend

`server/db.json` and the json-server routes stand in for a backend owned by
another team. Treat them as if they were.

**Never reshape the API to suit the front-end.** When the domain wants a field
the API does not have, or wants two of its fields folded into one, that
translation belongs in
[`HttpAppointmentsAdapter`](libs/appointments/infrastructure/src/lib/http-appointments.adapter.ts).
Editing the server so the two shapes already agree deletes the reason the adapter
exists. This repository shipped that bug once: the domain type _was_ the wire
schema, and nothing caught it because both happened to have identical fields.

Off-limits without a stated change to the business requirements:

- renaming, adding, or removing a field so it matches the domain model;
- merging `date` and `startTime` because `Appointment` wants one `startsAt`;
- adding an endpoint because some component would be easier to write with it;
- moving a rule into the server to avoid implementing it in the domain.

**The line is contract versus content.** The _shape_ of the API belongs to the
other team. The _rows_ are demo fixtures, and may be edited, regenerated or
reseeded freely — moving an appointment to next Tuesday is fine, giving it a
`startsAt` is not.

When the API is genuinely wrong — it returns something no real backend should —
the answer is still not to quietly correct it at the source. Say so, and hold the
boundary in the adapter, which is where payloads are validated today.

## The Bruno collection follows the API, not the app

[`bruno/appointment-booking-api`](bruno/appointment-booking-api) documents what
the server does, independently of anything Angular. It is the same contract seen
from the other side, so the same rule holds: a request changes when the API
changes, never to match what a component would find convenient.

It must keep working. A request that returns nothing because the demo data moved
underneath it is a broken document, not a passing test — it describes an API that
no longer answers the way it claims. Fixture edits are allowed by the rule above,
so anything that reseeds `server/db.json` has to keep these requests answering
too.

## A test has to earn its place

The bar is not coverage. It is whether the test would catch a mistake someone
could plausibly make, and the way to find out is to **make that mistake**: break
the thing deliberately, watch the test go red, restore it. A test that stays
green through the bug it supposedly guards is worse than no test, because it
reads as protection.

Do not write:

- **provider-identity assertions** — asserting that a token resolves to the class
  the provider names restates configuration in a second language. It fails only
  when someone edits both files, and passes when the wiring is wrong in a way
  that matters;
- **tests for type-only code** — `libs/appointments/ports` is interfaces. The
  compiler already checks them, which is why that project has a `lint` target and
  no `test` target;
- **scaffolding in anticipation** — a second e2e assertion, a spec for a
  component nobody has broken yet. Wait for the bug that motivates it.

Do write the test that pins a decision someone would otherwise undo by accident —
the empty-`customerName` case is the model: it exists to stop `.min(1)` quietly
moving a business rule out of the domain.

## Traps that have already cost time here

**Vitest does not typecheck.** It transpiles, so a type error can sit in green
tests indefinitely. Two real ones this session: a structural fake `{ today: () =>
… }` kept compiling after the port renamed the method to `now()`, silently
returning `undefined`; and a `PropertyKey` reaching string interpolation. Lint
missed both too. After changing a signature, run:

```sh
for p in domain ports application infrastructure state ui feature shell; do
  npx tsc -p libs/appointments/$p/tsconfig.lib.json --noEmit
done
```

Class-based fakes fail at compile time. Object literals fail at runtime, in a
test that looks fine.

**An undeclared `lint` target is silently skipped.** `@nx/eslint` infers a target
named `eslint:lint`, which `nx run-many -t lint` does not match. Every project
needs `"lint": { "executor": "@nx/eslint:lint" }` in its `project.json`. Check the
project count in the output, not just that it passed.

**A static import of a lazy library is a lint error on purpose.** Importing
`@hexa/appointments-shell` from `app.config.ts` pulls the whole feature into the
initial bundle. Configuration reaches the shell as a function argument through the
route's dynamic import instead. If lint refuses an import, that is usually the
rule working.

**`includedScripts: []` in `package.json` is load-bearing.** Without it Nx infers
targets from `scripts`, so `npm test` (`nx run-many -t test`) finds a `test`
script and recurses.

**`.claude` is excluded in `vitest.config.mts`** because worktrees hold full
copies of the workspace, and a path filter would otherwise count stale code twice.

**json-server serves `db.json` from memory.** `git restore server/db.json` does
not reach a running server — restart it, or you will read a stale payload and
believe it.

## Documentation conventions

Numbers that describe current state rot silently, and a reader cannot tell a
stale one from a fresh one. Prefer the reason a number holds ("chained validators
hang off the schema instance, so a bundler cannot drop them") over the number
itself, and name the command that reprints it.

Every entry under **Deliberate trade-offs** in the README carries the condition
that should reverse it. A trade-off without a trigger is indistinguishable from
an oversight a year later.
