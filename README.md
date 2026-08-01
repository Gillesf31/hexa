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
    APPLICATION["application\n(type:application)"]
    INFRA["infrastructure\n(type:infrastructure)"]
    PORTS["ports\n(type:ports)"]
    DOMAIN["domain\n(type:domain)"]
  end

  APP --> FEATURE
  FEATURE --> APPLICATION
  FEATURE --> INFRA
  FEATURE --> PORTS
  FEATURE --> DOMAIN
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
  FEATURE_TYPE --> APPLICATION_TYPE["type:application"]
  FEATURE_TYPE --> INFRASTRUCTURE_TYPE["type:infrastructure"]
  FEATURE_TYPE --> PORTS_TYPE["type:ports"]
  FEATURE_TYPE --> DOMAIN_TYPE["type:domain\n(no outward cross-type imports)"]
  APPLICATION_TYPE --> PORTS_TYPE
  APPLICATION_TYPE --> DOMAIN_TYPE
  INFRASTRUCTURE_TYPE --> PORTS_TYPE
  INFRASTRUCTURE_TYPE --> DOMAIN_TYPE
  PORTS_TYPE --> DOMAIN_TYPE
```

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
