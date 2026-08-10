# NgRx Signal Store with Redux-style dispatch

**Date** · 2026-08-09
**Question** · Can `libs/appointments/state` move from NgRx Store/Effects to `@ngrx/signals` without giving up dispatch?
**Verdict** · Yes, through `@ngrx/signals/events`. Not taken now.
**Scope** · `libs/appointments/state`, `libs/appointments/feature`, `apps/book/src/app.config.ts`, `package.json`. No other library would change.
**Checked against** · `@ngrx/signals@22.0.0-rc.0`, read from the published tarball — not from memory

---

## Verdict

Possible, mechanical, and low-risk. It is not being done, because it does not
answer the question this repository exists to ask. The triggers that reverse
that are at the bottom, and the analysis is here so the next person does not
have to redo it.

The reason the question is worth asking at all is that `@ngrx/signals` on its
own has no dispatch. `withMethods` turns `store.dispatch(opened())` into
`store.load()` — a component calling a method that changes state, which is the
exact thing the current design refuses. So "signal store" and "keep dispatch"
look like opposites, and they are not: `@ngrx/signals/events` is a first-party
subpath that restores events, a dispatcher, a reducer and effects on top of the
signal store.

## The mechanism

One-to-one, with nothing left over:

| today                                 | after                                                    |
| ------------------------------------- | -------------------------------------------------------- |
| `createActionGroup` / `props`         | a record of `event(type, type<Payload>())` creators      |
| `createFeature` + `createReducer`     | `signalStore(withState(…), withReducer(on(…)))`          |
| `createSelector`                      | `withComputed`                                           |
| `@Injectable` effect + `createEffect` | `withEventHandlers`                                      |
| `store.dispatch(…)`                   | `injectDispatch(events).opened()`                        |
| `store.selectSignal(…)`               | `store.appointments()` — the store _is_ signals          |
| `provideState` + `provideEffects`     | `provideDispatcher()` and the store class                |
| `provideStore()` in `app.config.ts`   | nothing; the application root stops knowing state exists |

The store, as it would actually be written:

```ts
export const AppointmentsStore = signalStore(
  withState(initialAppointmentsState),
  withComputed(({ status, lastErrorMessage }) => ({
    isLoading: computed(() => isLoading(status())),
    errorMessage: computed(() => visibleErrorMessage(status(), lastErrorMessage())),
  })),
  withReducer(
    on(appointmentsPageEvents.opened, appointmentsPageEvents.refreshed, startedLoading),
    on(appointmentsApiEvents.loadedSuccess, ({ payload }) => loadedAppointments(payload)),
    on(appointmentsApiEvents.loadedFailure, ({ payload }) => failedToLoad(payload)),
  ),
  withEventHandlers((_store, events = inject(Events), getAppointments = inject(GetAppointmentsUseCase)) => ({
    loadAppointments: loadAppointments(events.on(appointmentsPageEvents.opened, appointmentsPageEvents.refreshed), getAppointments),
  })),
);
```

Every name in that file comes from a file with no framework in it.
`startedLoading`, `loadedAppointments` and `failedToLoad` return
`Partial<AppointmentsState>`; `isLoading` and `visibleErrorMessage` are
projections over two plain values; `loadAppointments` is
`(requests$: Observable<unknown>, useCase: GetAppointmentsUseCase) => Observable<AppointmentsApiEvent>`.
The store file is wiring and contains no branch. That is what keeps the specs
framework-free, and it is the whole reason this shape was chosen over the
idiomatic one that inlines the reducers and the effect.

Two behaviours of the plugin are load-bearing and not obvious from reading it:

- `withEventHandlers` **auto-dispatches** any emitted value that is an event
  instance, so the handler's `loadedSuccess(…)` returns to the bus without the
  store mentioning a dispatcher.
- `ReducerEvents` fires before `Events`, so by the time a handler runs, the
  reducer has already applied `loading`. No handler needs to set a flag of its
  own.

## Things that will cost an afternoon if they are not known first

Each of these was found by reading the published `.d.ts` and bundle, and each
would otherwise be found by a confusing failure.

**`withEffects` does not exist.** It was renamed `withEventHandlers` in v21. The
shipped type definitions still say `withEffects` in several docblocks, including
the ones the editor shows on hover. Trust the export list, which is
`Dispatcher, Events, ReducerEvents, event, eventGroup, injectDispatch,
mapToScope, on, provideDispatcher, toScope, withEventHandlers, withReducer`.

**`eventGroup` renames the events.** It builds the type from the literal
property key with none of the camel-case translation `createActionGroup`
performs, so `{ opened: … }` under `Appointments Page` prints
`[Appointments Page] opened`. Keying it `Opened` fixes the string and forces
`dispatch.Opened()` at every call site; `'Loaded Success'` fixes it and forces
`dispatch['Loaded Success'](…)`. Since `injectDispatch` accepts any
`Record<string, EventCreator>`, a plain record of `event('[Appointments Page] Opened')`
creators keeps both halves and costs one line each. That is why the sketch above
uses a record.

**A payload is one value, not a props object.**
`props<{ appointments: Appointment[] }>()` becomes `type<Appointment[]>()`, and
handlers read `({ payload })`. The object wrapper existed because a classic
action needed one.

**`type<T>()` is exported from `@ngrx/signals`, not from `@ngrx/signals/events`.**

**The current derived selector collides with the state field it derives from.**
`selectAppointmentsErrorMessage` would become a computed named `errorMessage`
over a state field also named `errorMessage`, and `withComputed` may not
introduce a key `withState` owns — a type error, and at runtime only a
`console.warn`. The rename is mandatory. The one that reads best is state
`lastErrorMessage` ("what the last failure said") and computed `errorMessage`
("what the screen should print"), because the collision was a symptom of the two
never having been distinguished.

**A signal store is constructed lazily.** `provideEffects` subscribes when the
route's environment injector is created; a store class does nothing until
something injects it. Today `AppointmentsPageComponent` injects it in a field
initialiser, strictly before `ngOnInit` dispatches — so it works, and it works
by accident of who reads the state first. `provideEnvironmentInitializer(() => inject(AppointmentsStore))`
in `provideAppointmentsState()` restores the guarantee in one line.

**`provideDispatcher()` scopes all three services** — it returns
`[Events, ReducerEvents, Dispatcher]`. Adding it to the route's providers would
put the bus in the same environment injector as the state and the port bindings,
which is what the rest of this design does. The cost is that no root-level event
could reach this store.

## What the boundaries say

Nothing has to move. `type:state` may depend on `type:domain` and
`type:application` and carries no `bannedExternalImports`, so `@ngrx/signals` is
legal there exactly as `@ngrx/store` is. The three
`bannedExternalImports: ['@angular/*', '@ngrx/*']` entries on `domain`, `ports`
and `application` keep working unchanged — `@ngrx/signals` matches `@ngrx/*`. The
only new external import outside `state` would be `@ngrx/signals/events` in
`feature`, for `injectDispatch`, where `@ngrx/store` is imported today.

Dependencies: three packages out (`@ngrx/store`, `@ngrx/effects`,
`@ngrx/store-devtools`), one in. `@ngrx/signals@22.0.0-rc.0` peers only
`@angular/core ^22.0.0` and an optional `rxjs`, so `npm install` needs no
overrides, and no `vitest.config.mts` alias — the subpaths resolve through the
package's own `exports` map. Reprint that with:

```sh
npm view @ngrx/signals@22.0.0-rc.0 peerDependencies exports --json
```

## What it would do to the tests

This is the part that decides it, so it comes before the ergonomics.

`appointments.selectors.spec.ts` gets **shorter**. `createSelector(…).projector(…)`
is ceremony around calling a pure function, and extracting `isLoading` and
`visibleErrorMessage` deletes the wrapper.

`load-appointments.effects.spec.ts` survives nearly intact.
`new LoadAppointmentsEffects(new Actions(subject), useCase)` becomes
`loadAppointments(subject, useCase)` — still a `Subject`, still `firstValueFrom`,
still no `TestBed`. The structural-fake trap is untouched: the port fakes stay
compile-checked, so `npx nx run-many -t typecheck` still catches a renamed port
method.

`appointments.reducer.spec.ts` keeps every assertion but tests the updaters
instead of a reducer, and the "keeps the current appointments visible while
refreshing" case gets stronger — with `Partial<AppointmentsState>` updaters, the
appointments survive because the key is absent, which is visible in the updater
rather than in a spread. The one assertion that genuinely weakens is
`reducer(undefined, { type: 'unknown' })`: there is no reducer to feed an unknown
action to, so it degenerates into restating a constant, and should be deleted
rather than kept as decoration.

**What is lost, as a specific mistake rather than a coverage number.**
`on(opened, refreshed, …)` and `events.on(opened, refreshed)` in the store file
would be the only lines in `libs/appointments/state` no spec reaches. Reaching
them means constructing the store, which means `TestBed.inject`, which throws
`Need to call TestBed.initTestEnvironment() first` — and `vitest.setup.ts`
contains only `import '@angular/compiler';`. Today those two lines are one line,
`ofType(opened, refreshed)`, and the effect spec covers it framework-free by
pushing a real action through a real `Actions` stream.

So after the migration, deleting `refreshed` from either list turns nothing red.
`npx nx e2e book-e2e` would catch the same mistake made to `opened`, and nothing
would catch it made to `refreshed`. Adding a test environment to close that is a
larger regression than the hole it fills — it makes this library's specs
framework-dependent to protect two lines of wiring.

## What it would cost and buy

Buys: three runtime dependencies become one, and `@ngrx/store-devtools` stops
shipping in the production bundle, where it is currently included in `logOnly`
mode (`npx nx build book` prints the delta). The state library's public surface
shrinks to the store, the page events and the provider.
`apps/book/src/app.config.ts` stops knowing the application has state at all,
which completes the story the README already tells about the lazy route owning
its wiring. And every line with a decision in it ends up in a file that imports
no framework, where today the reducer imports `@ngrx/store` and the selectors
import `createSelector`.

Costs: Redux DevTools, below. The two uncovered lines above. A dependency on a
plugin younger than the store it plugs into, which has already renamed a public
feature between majors and still ships docblocks describing the old name.

The one argument that is about _this_ repository rather than about signal stores
in general: **the core would not move by one character.** `domain`, `ports`,
`application` and `infrastructure` would survive a complete replacement of the
state management library with a zero-line diff. That is the claim hexagonal
architecture makes, and this repository has never tested it. It is better
evidence than the re-routing rule the README currently cites, and it points the
other way — not that adding a rule is cheap, but that the framework is genuinely
on the outside. If this is ever done, the diffstat is the finding, and the commit
message should say so.

## Devtools

`@ngrx/signals` ships none. The maintained third-party feature that provides one,
`@angular-architects/ngrx-toolkit`, does not yet accept this workspace's Angular:

```sh
npm view @angular-architects/ngrx-toolkit peerDependencies
```

Writing one by hand was considered and rejected. It would subscribe to `Events`
and push to `window.__REDUX_DEVTOOLS_EXTENSION__` — the first `globalThis` access
anywhere in `libs/`, in a repository whose stated bar is that a test must catch
a mistake someone could plausibly make, and this one would be verified by opening
a browser panel and looking. It would also give a one-way log and not time
travel, which needs the extension's subscribe channel and a way to replay events
through `ReducerEvents` without re-triggering the handlers.

What is actually forgone is smaller than it sounds: over four event types and
three state fields, the timeline per page load is `idle → loading → loaded`, and
time travel across three steps answers no question anyone is asking. If the log
is ever wanted before the toolkit catches up, the honest stopgap is a
`withEventHandlers` entry that `tap`s every event to `console.debug` under
`isDevMode()`, not thirty lines impersonating an extension integration.

## The triggers

Either of these reverses the decision:

- **The devtools cost disappears** — the command above names `@angular/core ^22`,
  or `@ngrx/signals` ships devtools of its own.
- **The second feature lands and the state layer is being edited anyway.** Folded
  into work already touching these files, the migration costs the two uncovered
  lines and nothing else. Standalone, it costs a day on the layer that was
  already correct, and delays the only test that settles the question this
  repository exists to ask — whether booking an appointment reuses `domain`,
  `ports` and `application` as they stand.

Explicitly not a trigger: a new NgRx release, or the signal store becoming the
default in the documentation.

---

The code sketches here are typed against the published `.d.ts` and have not been
compiled. To trust rather than read them: on a scratch branch,
`npm i @ngrx/signals@22.0.0-rc.0`, write the store file, run
`npx nx run-many -t typecheck`, and throw the branch away.
