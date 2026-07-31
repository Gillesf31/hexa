# Appointment Booking — Business Requirements

## Requirement 1: Display appointments

As a customer, I can see the list of existing appointments so that I know which appointments are already scheduled.

The screen displays every appointment returned by the application, including:

- customer name;
- appointment date;
- start time;
- duration in minutes.

For the initial increment, displaying the supplied appointments is the only user-facing behaviour. Creating, validating, filtering, cancelling, or rescheduling appointments is out of scope.

## Technical boundaries

Implement this requirement using the application's ports-and-adapters structure:

- a **list appointments use case** owns the application behaviour;
- an **appointment repository port** defines how the use case obtains appointments;
- an **in-memory appointment service** implements that port and supplies the initial data;
- a **primary adapter** presents the appointments returned by the use case.

The use case depends only on the repository port. It must not depend directly on the in-memory service or on the primary adapter.

## Acceptance criteria

1. The application has a use case that returns the available appointments.
2. The use case retrieves appointments through an appointment repository port.
3. An in-memory adapter implements that port and provides appointment data.
4. The primary adapter invokes the use case and displays each returned appointment's customer name, date, start time, and duration.
5. No appointment can be created, changed, or deleted in this increment.

## Not included in this increment

- booking an appointment;
- appointment availability or overlap checks;
- opening-hour rules;
- filtering appointments by date;
- cancellations or rescheduling;
- persistence beyond the in-memory service;
- multiple advisors;
- customer accounts, payments, reminders, or time-zone conversion.
