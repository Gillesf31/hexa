# Clean Architecture Review

**Date** · 2026-08-07
**Scope** · Full audit — all 33 non-spec TypeScript files under `libs/` and `apps/`, all 13 spec files, 9 `project.json`, `eslint.config.mjs`, `tsconfig.base.json`, `vitest.config.mts`, `server/db.json`, `README.md`, `docs/`. Nothing sampled.
**Stack** · TypeScript 6 / Angular 22 / NgRx 22, Nx 23 monorepo (9 projects), Angular DI (`InjectionToken` + `makeEnvironmentProviders`), Vitest 4 (+ `@angular/build:unit-test` for the UI lib)
**Supersedes** · `docs/architecture-review.html` (2026-08-05)

---

## Verdict

The Dependency Rule is respected, and not by accident — it was verified by import, not by folder. `libs/appointments/domain` and `libs/appointments/application` contain zero Angular, zero NgRx, zero HTTP and zero hidden I/O; the use case at `libs/appointments/application/src/lib/get-appointments.use-case.ts:8-21` is constructor-injected with two port _interfaces_ and is built with a plain `new` in exactly one place. This is genuinely better than most Angular codebases that claim the same thing.

The single most consequential gap is that **the domain type is also the wire schema**. `HttpAppointmentsAdapter` casts the json-server response straight to `Appointment` (`http-appointments.adapter.ts:8`) and its own test asserts the absence of translation. There is no anti-corruption layer, only a coincidence: `server/db.json:3-9` and `libs/appointments/domain/src/lib/appointment.ts:1-7` happen to have identical fields.

The second consequential gap is that the guardrail everyone trusts has a hole big enough that it has _already_ been used — `@angular/core` is imported inside the ports library and lint is green.

There are **no Critical findings**.

### Maturity

| #   | Rung                                                | Status                                                                                                     |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 0   | A safety net: critical journeys have a test         | ⚠️ Domain/application/state/infra covered; the composition root, the page component and end-to-end are not |
| 1   | Awkward dependencies behind ports                   | ✅ Clock and HTTP both; no `new Date()`/`Date.now` anywhere in domain or application                       |
| 2   | A composition root; the app can run with no backend | ⚠️ Root is exemplary; the offline path exists but is unreachable                                           |
| 3   | A rule's test needs no framework harness            | ✅ Verified                                                                                                |
| 4   | Actions named in the domain's language              | ✅ `[Appointments Page] Opened` / `Refreshed`, not `setAppointments`                                       |
| 5   | New rules born from a failing test                  | ❓ Not determinable from a snapshot                                                                        |
| 6   | No wire type imported by the core                   | ⚠️ No wire type is imported because none exists — the domain type _is_ the wire type                       |
| 7   | Two adapters per port; the product walks offline    | ⚠️ Two per port exist; offline is not reachable without editing source                                     |
| 8   | Reactions decoupled                                 | ✅ NgRx effects, correctly placed outside the core                                                         |
| 9   | A lint/arch rule refuses a wrong-way dependency     | ⚠️ For project edges yes; for npm packages no                                                              |

---

## What is working

These are the expensive parts to get right, and this repo got them right.

- **The use case is a use case.** `libs/appointments/application/src/lib/get-appointments.use-case.ts:14-21` reads exactly as _ask a port · apply a policy · tell the caller_: `getAppointments()` piped through two named domain functions and `this.clock.today()`. No `if`, no date arithmetic, no decision of its own. The decisions live in `libs/appointments/domain/src/lib/appointment.rules.ts:3-14` as two pure functions.
- **The composition root is textbook, including the part everyone gets wrong.** `libs/appointments/shell/src/lib/provide-appointments-shell.ts:25-30` wires the use case as `useFactory: () => new GetAppointmentsUseCase(inject(APPOINTMENTS_PORT), inject(CLOCK_PORT))` — framework outside the parenthesis, domain inside. There is no `@Injectable()` on the use case, so it can be built with a bare `new`, and the tests do exactly that. The host/feature split (`apps/book/src/app.config.ts:8-16` chooses framework infrastructure; the shell chooses adapters, scoped to the route) is the legitimate two-root shape, not scattered wiring.
- **The rules are testable without a framework.** `appointment.rules.spec.ts` and `get-appointments.use-case.spec.ts:27` use hand-written fakes and `new`. Even the NgRx effect is tested framework-free: `libs/appointments/state/src/lib/load-appointments.effects.spec.ts:31` constructs `new LoadAppointmentsEffects(new Actions(dispatched), useCase)` with no `TestBed`. 35 tests in 405 ms.
- **Every port has two implementations, and one of them is a fake.** `SystemClockAdapter` / `FakeClockAdapter`, `HttpAppointmentsAdapter` / `InMemoryAppointmentsAdapter`. This is rung 7 material and it is rare.
- **Time is treated as I/O properly.** `SystemClockAdapter` takes `now: () => Date` as a constructor default (`system-clock.adapter.ts:4`), so even the adapter that _is_ the clock is deterministic under test.
- **The store records, it does not decide.** Every `on()` handler in `appointments.reducer.ts:23-45` is a state assignment. Actions are named after their source. The only conditionals are in selectors (`appointments.selectors.ts:6,12`), which is presentation shaping in the right place.

---

## Findings

### 🟠 Major — the boundary erodes

#### F1 · There is no anti-corruption layer; the vendor's schema is the domain model

**Where** `libs/appointments/infrastructure/src/lib/http-appointments.adapter.ts:8` · `libs/appointments/domain/src/lib/appointment.ts:1-7` · `server/db.json:3-9` · asserted-by-test at `http-appointments.adapter.spec.ts:21-26`

**What** `getAppointments = () => this.http.get<Appointment[]>('http://localhost:3000/appointments')` — the generic parameter is a _claim_, not a conversion. No wire type is declared in the adapter, no mapping function exists, nothing validates the payload. The domain `Appointment` is field-for-field identical to a json-server table row, including `date`/`startTime` as bare strings.

**Why it hurts here** Two concrete consequences. First: the day json-server is replaced by a real API returning `start_time`, `duration_minutes`, or a nested `customer: { name }`, the diff does not land in the adapter — it lands in `appointment.ts`, and from there into the reducer, the selectors, `AppointmentCardComponent`, and thirteen test fixtures across four libraries. The seam that exists to absorb that change will not absorb it. Second: a malformed payload flows into the core unchecked, so `appointment.customerName.trim()` at `appointment.rules.ts:13` throws a `TypeError` _inside a domain rule_ for a fault that originated at the network edge. The adapter's second test actively locks the absence of translation in place.

**Smallest correction** Declare `type AppointmentResource = { id: string; customerName: string; ... }` inside `http-appointments.adapter.ts`, never export it, and add `map(toAppointment)`. Change the spec from "passes the response through untouched" to an assertion about the mapping. Ten lines; the domain type is then free to diverge (e.g. `date` becoming a value object) without touching the API.

#### F2 · The guardrail does not cover external packages — and the hole is already in use

**Where** `eslint.config.mjs:18-138` (no `bannedExternalImports` / `allowedExternalImports` on any `depConstraint`)

**What** `@nx/enforce-module-boundaries` is configured with `scope:` and `type:` tags and correctly forbids, say, `type:domain` importing `type:infrastructure`. It says nothing about npm dependencies. Verified empirically: `npx nx run-many -t lint` passes 9/9 while `libs/appointments/ports/src/lib/appointments.port.ts:1` imports `@angular/core`. Nothing today would stop `import { HttpClient } from '@angular/common/http'` being added to `libs/appointments/domain`.

**Why it hurts here** The repo's whole claim — README, business requirements doc, prior review — is that the direction is "an executable rule, not a convention". For inter-project edges that is true. For the class of violation that actually kills a hexagon in an Angular app (a framework type leaking into the core), it is still convention. F3 is the proof that the hole gets used when it is available.

**Smallest correction** Add to the `type:domain`, `type:ports` and `type:application` constraints:

```js
bannedExternalImports: ['@angular/*', '@ngrx/*'];
```

This converts every future instance of F3 into a build error. Do it after F3 is fixed, or `ports` fails immediately.

#### F3 · The Angular DI token lives in the ports library

**Where** `libs/appointments/ports/src/lib/appointments.port.ts:1,9` · `libs/appointments/ports/src/lib/clock.port.ts:1,7`

**What** Both port files import `InjectionToken` from `@angular/core` and export a token alongside the interface. The interface and the DI mechanism for locating its implementation are colocated in the most stable library in the system.

**Why it hurts here** `libs/appointments/ports` is the only project the core (`domain`, `application`) depends on, and it now depends on Angular. The consequences are bounded but real: the port contract cannot be reused by a Node CLI, a web worker or a server-side consumer without dragging Angular in; the ports library's version now moves with the framework's; and a _composition_ decision (how implementations are located) has been placed inside the _contract_. It is also the one place where F2's hole was actually exercised.

**Not Critical, and why** the use case imports the port with `import type` (`get-appointments.use-case.ts:6`), which TypeScript erases — so at runtime the application layer carries no Angular. This is a compile-graph and reusability problem, not a "the domain calls the framework" problem.

**Smallest correction** Move `APPOINTMENTS_PORT` and `CLOCK_PORT` into `libs/appointments/shell` (they are consumed only by `provide-appointments-shell.ts:9`) or into a tiny `type:di` library. `libs/appointments/ports` then contains two interfaces and imports nothing but `rxjs` and the domain — and F2's `bannedExternalImports` can be switched on.

#### F4 · The composition root and the only page component have no tests at all

**Where** `libs/appointments/shell/project.json:11` and `libs/appointments/feature/project.json:11` (both `--passWithNoTests`) · `apps/book/project.json` `test` target (same) · zero spec files exist in `shell/src` or `feature/src`

**What** `provide-appointments-shell.ts` — the file that decides which adapter every port gets and constructs the use case — is never executed by a test. `AppointmentBookComponent`, which dispatches `opened()` on init and binds three selectors, is never rendered by a test. All three targets report success on an empty suite. `README.md:187` documents `npx nx test book` as one of three checks; that command asserts nothing whatsoever.

**Why it hurts here** With `useFactory` + `inject()`, a missing or misordered binding is not a compile error — it fails at _injection_ time, in the browser, on the appointments route. The prior review already flagged the primary-adapter gap on 5 August; the UI leaf components got specs since, the two projects that actually wire the system did not. The system's most reversible parts are the best tested and its least reversible part is untested.

**Smallest correction** One spec in `shell`: build an environment injector from `provideAppointmentsShell(true)`, resolve `GetAppointmentsUseCase`, assert it emits the in-memory appointments. Then delete `--passWithNoTests` from that target so it can never silently empty out again.

#### F5 · Every test target currently runs a stale, gitignored copy of the repo

**Where** `package.json:6` (`vitest run libs`) · `vitest.config.mts:22` (`exclude` covers `node_modules`, `dist`, `libs/appointments/ui/**` — not `.claude/**`) · `libs/appointments/*/project.json` test commands, which pass a path _filter_, not a glob

**What** Vitest CLI path arguments are substring filters. `.claude/worktrees/fix-ui-test-watch/` holds a full copy of the workspace, so `libs` and `libs/appointments/domain/src` both match it. Observed: `npm test` reports **22 test files / 78 tests with 8 failures**; the real tree has **9 files / 35 tests, all passing**. `nx test appointments-domain` reports 2 files / 14 tests for a project with 1 file and 7 tests. Every number is doubled and the headline command is red.

**Why it hurts here** F4's remedy is worthless if the suite's output cannot be trusted. A developer running the documented command sees eight failures originating in a directory that is not part of the repository, which is precisely the conditioning that teaches a team to ignore a red suite. The last commit (`7c853a8`) was already a fight with this test target.

**Smallest correction** Add `'**/.claude/**'` to `vitest.config.mts:22`. One line, and every other receipts finding becomes measurable.

#### F6 · The offline path exists, is tested as a class, and is unreachable as a product

**Where** `provide-appointments-shell.ts:12,20-22` · `appointments.routes.ts:8`

**What** `provideAppointmentsShell(useInMemory = false)` selects `InMemoryAppointmentsAdapter` when `true`. The only call site is `provideAppointmentsShell()` — no argument, anywhere in the repo. There is no environment file, route variant, query-param switch or dev bootstrap that passes `true`.

**Why it hurts here** `apps/book/docs/in-memory-services.md` argues at length for offline development and proposes a per-feature override mechanism; the code has the adapter and the parameter but not the switch. To demo without a backend a developer must edit `appointments.routes.ts` and remember to revert it. Rung 7 is claimed by the docs and not delivered by the product. And because no test constructs the shell with `true` (F4), the in-memory _wiring_ can break while `InMemoryAppointmentsAdapter`'s own four tests stay green.

**Smallest correction** Read the flag from `apps/book/src/app.config.ts` (or an `environment.ts`) and thread it into `appointmentsRoutes`, as `in-memory-services.md` itself recommends. Then the F4 shell spec covers both branches.

### 🟡 Minor — convention, naming, noise

#### F7 · The API base URL is a string literal inside the adapter

`http-appointments.adapter.ts:8` hard-codes `http://localhost:3000/appointments`, and `http-appointments.adapter.spec.ts:18` pins it. Not a dependency-rule break — configuration in an adapter is the right _side_ — but no deployed environment can differ from a developer's laptop without a code change, and the test would then need editing too. Take a base URL through the constructor and supply it from the shell.

#### F8 · A test double is exported from the production public API

`libs/appointments/infrastructure/src/index.ts:1` exports `FakeClockAdapter`, whose only consumer in the entire repo is its own spec. It is reachable from the shell and would ship in the production bundle if it were ever provided. `InMemoryAppointmentsAdapter` is a deliberate, documented exception; this one is a dead export. Either give it a caller (a demo/test composition) or drop it from the barrel.

#### F9 · No single command runs the whole suite

`npm test` excludes `libs/appointments/ui/**` (`vitest.config.mts:22`, with an honest comment explaining why: signal inputs need the AOT compiler). Those 8 component tests only run under `npx nx test appointments-ui`. The split is technically justified, but no script runs both, and `README.md:185-189` lists neither. Add a `test:all` script chaining the two.

### ⚪ Trade-offs — defensible, but should be deliberate

- **`Observable` in the port signature.** `appointments.port.ts:2,6` types the port as `Observable<Appointment[]>`, so `rxjs` sits in the ports and application libraries. Pragmatic in Angular and it costs almost nothing today. The cost surfaces if the core is ever consumed outside RxJS, or if a port's stream semantics (does it complete? does it re-emit?) become part of the contract without being written down. _This deviation is not declared anywhere._ One paragraph in the README — "ports return Observables; revisit if the core is reused off-Angular" — turns a finding into a decision.
- **Client-side filtering of past appointments.** The API supports `GET /appointments?date=YYYY-MM-DD` (`README.md:170`, `bruno/appointment-booking-api/02-*.bru`) but `HttpAppointmentsAdapter` fetches everything and `filterCurrentAndFutureAppointments` discards the past on the client. Correct for hexagonal purity — the rule is in the core and testable — and correct for a demo dataset. It stops being correct at a few thousand rows. The trigger for revisiting is the first slow page load; the fix is a port method that takes a criterion, not moving the rule into SQL.
- **Proportionality.** Eight Nx libraries, eight `project.json`, twenty-four tsconfigs, two ports, two DI tokens, an effect, a reducer and three selectors — around the two lines of business rule in `appointment.rules.ts:7,13` and a read-only list screen. On a product, this ratio would be the finding. Here it is not: `README.md:1` calls it an exercise, `docs/` ships teaching material on test doubles, and the structure is the deliverable. Worth saying out loud anyway, because the honest moment of judgement is the _second_ feature: if booking an appointment reuses `domain`/`ports`/`application` as-is, the trade paid off; if it needs new libraries at every layer to add one form, the granularity is too fine and `ports` should merge into `application`.
- **Route-scoped providers.** `appointments.routes.ts:6-9` puts the port bindings in the route's environment injector rather than the app root. Genuinely good — per-flow state cannot bleed between features — and it is explained in `README.md:130-136`. Worth keeping, worth knowing that lazy-loading the route twice creates two use-case instances.

---

## Remediation path

Each step stands alone; none exceeds a few days.

| #   | Step                                                                                                                                                                                                                          | Effort     | Unblocks                                                                                           | Done when…                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Add `'**/.claude/**'` to `vitest.config.mts` exclude; add a `test:all` script covering the UI lib                                                                                                                             | 15 min     | Everything below — nothing is measurable until the suite is honest                                 | `npm test` reports 9 files / 35 tests, green; `test:all` also runs the 8 UI tests                     |
| 2   | Move `APPOINTMENTS_PORT` / `CLOCK_PORT` out of `libs/appointments/ports` into the shell; then add `bannedExternalImports: ["@angular/*","@ngrx/*"]` to the `type:domain`, `type:ports`, `type:application` constraints        | Half a day | Makes F3 unrepeatable and closes F2 permanently                                                    | `ports` imports only `rxjs` + domain; lint fails on a deliberate `@angular/core` import into `domain` |
| 3   | One spec in `libs/appointments/shell` that builds the injector from `provideAppointmentsShell(true)` and resolves `GetAppointmentsUseCase`; delete `--passWithNoTests` from that target                                       | Half a day | Catches broken wiring at test time instead of on the route                                         | Deleting a provider from the shell turns a test red                                                   |
| 4   | Declare `AppointmentResource` inside `http-appointments.adapter.ts`, add `map(toAppointment)`, rewrite the pass-through spec as a mapping spec                                                                                | 1 day      | The domain type can evolve independently of the API; malformed payloads stop reaching domain rules | Renaming a field in `server/db.json` requires a change in exactly one file                            |
| 5   | Thread the in-memory switch from `app.config.ts` through `appointmentsRoutes`; cover both branches in the step-3 spec                                                                                                         | Half a day | The product actually walks offline; the docs' claim becomes true                                   | `npx nx serve book` with the flag set renders six appointments with the API stopped                   |
| 6   | One spec for `AppointmentBookComponent` (dispatches `opened()` on init, renders selected appointments, shows the error state); drop `--passWithNoTests` from `feature`. Move the base URL to an injected constructor argument | 1 day      | Closes the last untested seam the prior review flagged; F7                                         | `nx test appointments-feature` runs at least one test and fails if the dispatch is removed            |

---

## Assumptions & limits

- **The boundary used.** The core is taken to be `libs/appointments/domain` + `libs/appointments/application`, with `libs/appointments/ports` as the core's own contract surface. Inferred from the import graph, not the names: those are the only projects with no framework runtime imports and no outward edges. The repo's declared layering (`README.md:11-100`) agrees, and the Nx tags implement it. `state`, `feature`, `ui`, `infrastructure` are adapters; `shell` + `apps/book` are composition.
- **Coverage.** Exhaustive, not sampled — 46 TypeScript files exist under `libs/` and `apps/`; all 33 non-spec files and all 13 specs were opened. `docs/*.html` was not read beyond extracting the prior review's text, nor the Bruno collection beyond its endpoint list.
- **What was run.** `npx nx run-many -t lint` (9/9 pass — how F2 was confirmed empirically rather than by reading config), `npm test`, `npx vitest run` with corrected excludes, `npx nx test appointments-ui`, `npx nx run-many -t test`.
- **Questions only the team can answer.** (a) Is `Observable` in the port signature a considered decision or the path of least resistance? (b) Is `FakeClockAdapter`'s export from the production barrel intended for a composition that has not been written yet? (c) Was the `useInMemory` parameter meant to be wired to configuration, per `in-memory-services.md`, or is it a manual toggle by design? (d) Is `.claude/worktrees` expected to persist on developer machines, or was it left behind by one session?
- **Rung 5 is not determinable.** Whether rules are born from failing tests cannot be read from a snapshot; the commit history shows tests and implementations landing together, which is consistent with both TDD and after-the-fact testing.

---

## Out of scope, noticed anyway

- `filterAppointmentsWithCustomerName` (`appointment.rules.ts:10-13`) is applied by the use case and covered by 3 tests, but appears in no requirement in `docs/appointment-booking-business-requirements.md` — an undocumented rule silently hiding rows.
- `libs/appointments/ports` has no `test` target at all in `project.json`, so `nx run-many -t test` quietly covers 8 of 9 projects.
- `tsconfig.base.json:22` sets `"strict": false`, but every library overrides it to `true` — harmless today, a trap for the next library generated without the override.
- No e2e or route-level test exists anywhere, so "open the app, see appointments" is verified by no automated check.
- `git status` shows `package-lock.json` modified and uncommitted.
