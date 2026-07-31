# Hexa

Appointment-booking exercise built with Angular and a local JSON Server API.

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
