# Appointment Booking — Business Requirements

## Requirement 1: Display appointments

As a customer, I can see the list of existing appointments so that I know which appointments are already scheduled.

The screen displays every appointment returned by the application, including:

- customer name;
- appointment date;
- start time;
- duration in minutes.

For the initial increment, displaying current and upcoming appointments is the only user-facing behaviour. Creating, validating, cancelling, or rescheduling appointments is out of scope.

Two exclusions apply to the list:

- **appointments before today are not displayed.** Only what is still actionable is worth showing.
- **appointments with no customer name are not displayed.** The screen identifies an appointment by its customer name, so a row with an empty or whitespace-only name cannot be recognised or acted on. The appointment data comes from an external system, which can return incomplete records regardless of what its contract claims.

The second exclusion is a domain rule rather than a display concern: whether an appointment is showable is a decision about the appointment, so it belongs with the rules and is tested without a browser. It is deliberately a _filter_, not a validation — a record with no customer name is dropped, not reported. If incomplete records need to be surfaced rather than hidden, that is a payload-validation concern for the HTTP adapter, and it is not in this increment.

## Requirement 2: Announce re-routed appointments

As a customer, I can see which of the listed appointments will be handled by
someone else, so that I am not surprised on the day.

An appointment of **30 minutes or less** is not handled by the advisor who would
normally take it. The list says so on that appointment, in words: _re-routed to
another advisor_. Exactly 30 minutes is short enough to be re-routed.

This is a rule about the appointment, not about the screen, so it belongs with
the other rules and is tested without a browser. Unlike the two exclusions above
it is a _predicate_, not a filter: a re-routed appointment is still listed, still
shows the same four fields, and nothing about it changes except what the list
says about who will handle it.

It re-routes; it does not assign. No advisor is named, chosen, or recorded — see
_Not included_ below.

## Requirement 3: Announce appointments starting soon

As a customer, I can see which of the listed appointments start within the hour,
so that I know which one is imminent.

An appointment that starts within the next **60 minutes** is announced in the
list, in words: _starting soon_. Exactly 60 minutes away is close enough to be
announced, the same inclusive convention requirement 2 uses for its 30.

Like re-routing, this is a _predicate_, not a filter: the appointment is still
listed, still shows the same four fields, and nothing about it changes except
what the list says about it. The two announcements are independent — a
half-hour appointment starting in twenty minutes is both re-routed and starting
soon, and the list says both.

The rule is a window with two ends, and the second end is the point of it. The
exclusion in requirement 1 is at day granularity, so an appointment at 09:00
today is still displayed at 16:00 today. That appointment has already started
and is **not** starting soon. "Within the next 60 minutes" therefore means
_between now and an hour from now_, not merely _no more than an hour away_,
which an appointment seven hours in the past also satisfies.

Imminence is decided against the current instant, so the same reading of the
clock that decides what is displayed must decide what is announced. One reading
per execution: two readings taken moments apart can straddle midnight and make
the two rules disagree about which day it is.

## Technical boundaries

Implement this requirement using the application's ports-and-adapters structure:

- a **list appointments use case** owns the application behaviour;
- an **appointment repository port** defines how the use case obtains appointments;
- an **HTTP appointment adapter** implements that port and retrieves appointment data;
- a **clock port** supplies today's date so the use case can exclude past appointments;
- a **primary adapter** presents the appointments returned by the use case.

The use case depends only on the appointment repository port and the clock port. It must not depend directly on either concrete adapter or on the primary adapter.

## Acceptance criteria

1. The application has a use case that returns the available appointments.
2. The use case retrieves appointments through an appointment repository port.
3. An HTTP adapter implements that port and retrieves appointment data.
4. The use case excludes appointments before today.
5. The use case excludes appointments whose customer name is empty or whitespace only.
6. The primary adapter invokes the use case and displays each returned appointment's customer name, date, start time, and duration.
7. No appointment can be created, changed, or deleted in this increment.
8. The list states, on each displayed appointment of 30 minutes or less, that it will be re-routed to another advisor.
9. The domain decides whether an appointment is starting soon, from the appointment and the current instant.
10. An appointment starting in exactly 60 minutes is starting soon.
11. An appointment starting in 61 minutes is not starting soon.
12. An appointment whose start is in the past is not starting soon, even though it is still displayed.
13. The list states, on each displayed appointment that is starting soon, that it is starting soon.
14. Both statements appear together on an appointment that is both re-routed and starting soon.
15. The use case reads the current instant once per execution and judges every rule against that one reading.

## Not included in this increment

- booking an appointment;
- appointment availability or overlap checks;
- opening-hour rules;
- cancellations or rescheduling;
- multiple advisors — requirement 2 says an appointment _is_ re-routed, and stops
  there. Who receives it, whether that advisor is free, and how the hand-over is
  recorded are all out of scope: there is no advisor in the model at all;
- customer accounts, payments, reminders, or time-zone conversion;
- notifications, reminders, live countdowns, or auto-refresh — requirement 3
  announces imminence as a sentence in a list that is rendered once. It is not a
  reminder: nothing is pushed, nothing counts down, and the announcement is as
  fresh as the moment the screen was loaded and no fresher.
