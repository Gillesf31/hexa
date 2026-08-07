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
    FEATURE["feature\n(type:feature)"]
    UI["ui\n(type:ui)"]
    STATE["state\n(type:state)"]
    APPLICATION["application\n(type:application)"]
    INFRA["infrastructure\n(type:infrastructure)"]
    PORTS["ports\n(type:ports)"]
    DOMAIN["domain\n(type:domain)"]
  end

  APP --> FEATURE
  FEATURE --> UI
  FEATURE --> STATE
  FEATURE --> APPLICATION
  FEATURE --> INFRA
  FEATURE --> PORTS
  FEATURE --> DOMAIN
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

  APP_TYPE["type:app"] --> FEATURE_TYPE["type:feature"]
  FEATURE_TYPE --> UI_TYPE["type:ui"]
  FEATURE_TYPE --> STATE_TYPE["type:state"]
  FEATURE_TYPE --> APPLICATION_TYPE["type:application"]
  FEATURE_TYPE --> INFRASTRUCTURE_TYPE["type:infrastructure"]
  FEATURE_TYPE --> PORTS_TYPE["type:ports"]
  FEATURE_TYPE --> DOMAIN_TYPE["type:domain\n(no outward cross-type imports)"]
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
called from `provideAppointmentsFeature()`. The root store and the devtools live
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
npx nx test book
npx nx lint book
npx nx build book
```
