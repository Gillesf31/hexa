# Hexa

Appointment-booking exercise built with Angular and a local JSON Server API.

## Architecture review

Open [the current architecture review](docs/architecture-review.html) in a browser.

## Architecture boundaries

The appointment-booking slice is split into Nx libraries. Arrows show allowed
dependencies between the current projects.

```mermaid
flowchart TB
  APP["book app\n(type:app)"]

  subgraph APPOINTMENTS["appointments scope"]
    SHELL["shell\n(type:shell)"]
    FEATURE["feature\n(type:feature)"]
    UI["ui\n(type:ui)"]
    STATE["state\n(type:state)"]
    APPLICATION["application\n(type:application)"]
    INFRA["infrastructure\n(type:infrastructure)"]
    PORTS["ports\n(type:ports)"]
    DOMAIN["domain\n(type:domain)"]
  end

  APP --> SHELL
  SHELL --> FEATURE
  SHELL --> STATE
  SHELL --> APPLICATION
  SHELL --> INFRA
  SHELL --> PORTS
  FEATURE --> UI
  FEATURE --> STATE
  UI --> DOMAIN
  STATE --> APPLICATION
  STATE --> DOMAIN
  APPLICATION --> PORTS
  APPLICATION --> DOMAIN
  INFRA --> PORTS
  INFRA --> DOMAIN
  PORTS --> DOMAIN
```

### Nx dependency rules

[`eslint.config.mjs`](eslint.config.mjs) enforces these directions for any
project carrying the corresponding tags. Every arrow means "may depend on";
all other cross-project directions are rejected by
`@nx/enforce-module-boundaries`.

```mermaid
flowchart TB
  BOOK_SCOPE["scope:book"] -->|"only scope:appointments"| APPOINTMENTS_SCOPE["scope:appointments\n(no cross-scope imports)"]

  APP_TYPE["type:app"] -->|"only type:shell"| SHELL_TYPE["type:shell"]
  SHELL_TYPE --> FEATURE_TYPE["type:feature"]
  SHELL_TYPE --> UI_TYPE["type:ui"]
  SHELL_TYPE --> STATE_TYPE["type:state"]
  SHELL_TYPE --> APPLICATION_TYPE["type:application"]
  SHELL_TYPE --> INFRASTRUCTURE_TYPE["type:infrastructure"]
  SHELL_TYPE --> PORTS_TYPE["type:ports"]
  SHELL_TYPE --> DOMAIN_TYPE["type:domain\n(no outward cross-type imports)"]
  FEATURE_TYPE --> UI_TYPE
  FEATURE_TYPE --> STATE_TYPE
  FEATURE_TYPE --> DOMAIN_TYPE
  UI_TYPE --> DOMAIN_TYPE
  STATE_TYPE --> APPLICATION_TYPE
  STATE_TYPE --> DOMAIN_TYPE
  APPLICATION_TYPE --> PORTS_TYPE
  APPLICATION_TYPE --> DOMAIN_TYPE
  INFRASTRUCTURE_TYPE --> PORTS_TYPE
  INFRASTRUCTURE_TYPE --> DOMAIN_TYPE
  PORTS_TYPE --> DOMAIN_TYPE
```

## State management

NgRx holds the page state in `libs/appointments/state`. It is an outer layer:
the store knows the use cases, the use cases know nothing about the store.

- **Actions** are named after their source, not after the reducer:
  `appointmentsPageActions` for user intents, `appointmentsApiActions` for results.
- **The reducer** stores `Appointment` values from the domain plus a `status`
  and an `errorMessage`, so loading, empty, and failed states are distinguishable.
- **Effects** call `GetAppointmentsUseCase` and translate its result into actions.
  They never reach a port, an HTTP client, or a domain rule directly.
- **Selectors** derive what the template needs; components only dispatch and select.

```mermaid
sequenceDiagram
  participant C as AppointmentBookComponent
  participant S as Store
  participant E as LoadAppointmentsEffects
  participant U as GetAppointmentsUseCase
  participant P as AppointmentsPort

  C->>S: appointmentsPageActions.opened()
  S->>E: action
  E->>U: execute()
  U->>P: getAppointments()
  P-->>U: Appointment[]
  U-->>E: Appointment[] (domain rules applied)
  E->>S: appointmentsApiActions.loadedSuccess()
  S-->>C: selectors emit
```

`provideAppointmentsState()` registers the feature slice and its effects, and is
called from `provideAppointmentsShell()`. That provider is applied on the
appointments route in
[`libs/appointments/shell`](libs/appointments/shell/src/lib/appointments.routes.ts),
so the port bindings and the state slice live in the route's environment
injector rather than the application root. The root store and the devtools live
in [`apps/book/src/app.config.ts`](apps/book/src/app.config.ts).

## Getting started

Install dependencies:

```sh
npm install
```

Run the Angular application:

```sh
npx nx serve book
```

## Appointment API

Start the API at `http://localhost:3000`:

```sh
npm run api
```

The API supports:

- `GET /appointments`
- `GET /appointments?date=YYYY-MM-DD`
- `POST /appointments`

### Bruno collection

Import the [Appointment Booking API collection](/Users/gilferra/Sandbox/hexa/bruno/appointment-booking-api) in Bruno, select the `Local` environment, and run the requests. The create request persists a demo appointment.

Successful writes are persisted in `server/db.json`. To restore the two demo
appointments, stop the API and run:

```sh
git restore server/db.json
```

## Checks

```sh
npm test
npx nx run-many -t lint
npx nx build book
```

`npm test` runs every project's `test` target — 13 spec files, 43 tests. The `ui`
library goes through `@nx/angular:unit-test` because its component specs need the
Angular AOT compiler for signal inputs; every other library runs on plain Vitest.
Both are covered by that one command.

For a coverage report across `libs/`:

```sh
npm run test:coverage
```
