# In-memory services

An in-memory service implements the same application contract as a real service, but returns data kept in the application instead of calling an external API or database.

## Why use them in automated tests?

Tests should be fast, deterministic, and focused on the behaviour under test. An in-memory service helps because it:

- avoids starting a backend, configuring a database, or making network calls;
- returns known data, so assertions do not depend on shared or changing external state;
- can model useful cases directly, such as no appointments, one appointment, or a failed request;
- keeps unit and component tests quick enough to run frequently.

This lets a test verify that the UI displays appointments without also testing whether the API server is available.

## Why use them during manual development?

When manually checking a feature, a backend may be unfinished, offline, empty, or contain data that does not demonstrate the scenario being developed. An in-memory service gives developers stable sample data immediately.

It is useful for checking:

- page layout and appointment details;
- loading, empty, and error states;
- edge cases that would be inconvenient to create in a shared environment;
- a feature while working offline or before the API contract is ready.

Use the real service before release as well: the in-memory service validates the application's behaviour with controlled data, while the real service validates the integration with the API.

## Why not use a feature flag to select the service?

Feature flags are best for safely releasing or experimenting with user-facing product behaviour. Selecting an in-memory service or a production service is usually an application configuration concern instead: the choice determines where all data comes from, rather than which product behaviour a user sees.

Using a feature flag for this choice can create problems:

- the in-memory path may accidentally be enabled in a production environment, showing sample data instead of real data;
- each flag value creates another combination to test and support;
- the service choice can change at runtime, making a user's data source harder to reason about and diagnose;
- feature-flag infrastructure must be available before the application can determine how to obtain its data.

Prefer explicit test configuration for automated tests and explicit local or deployment configuration for manual development. This makes the selected data source visible at startup and keeps production integration separate from feature rollout decisions.

There can be exceptions, such as a short-lived internal demo or a carefully restricted support tool. In those cases, limit access, make the active data source obvious, and remove the flag when it is no longer needed.

## Proposal: enable local data per feature

Keep the production data-source providers as the default. For local development and tests, add a separate configuration that overrides only the features a developer wants to run in memory. A feature can therefore be enabled or disabled independently without changing its components or production implementation.

1. Give each feature a service token (for example, `CATALOG_SERVICE` or `BOOKING_SERVICE`). Components depend only on their feature's token.
2. Register the HTTP or production implementation as the default provider for every token.
3. Create a development- and test-only provider list that can replace selected tokens with their in-memory implementations.
4. Load that list only from the local-development or test bootstrap/configuration, never from the production bootstrap.

For example, a local configuration can make the choice explicit in one place:

```ts
const localDataSources = {
  catalog: 'memory',
  booking: 'api',
  customerProfile: 'memory',
} as const;
```

The development bootstrap converts this map into provider overrides. A feature set to `'memory'` receives its in-memory service; one set to `'api'` keeps the default production service. Tests can use the same mechanism with their own small configuration.

This keeps the toggle easy to find and review, allows different features to use different data sources, and prevents the local choice from being bundled into or evaluated by the production application. Keep personal local settings in an ignored file or inject them through a development-only environment configuration; commit a safe example file for the team.

## Switching implementations

Use dependency injection to select an implementation behind a service token or interface. The application code should depend on that abstraction, not on the in-memory or HTTP implementation directly.

```ts
// Production or integration environment
provideDataService(HttpDataService);

// Test or local-development environment
provideDataService(InMemoryDataService);
```

The exact syntax depends on the framework. The important part is that changing the data source does not require changing the feature or component code.
