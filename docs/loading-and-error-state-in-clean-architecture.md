# Where loading and error state belong

> Putting `isLoading` and `error` in the application store feels like putting UI
> concerns in the wrong place. Is it?

Short answer: **loading and error are interaction state, not UI state.** They
belong in the store. The thing to be suspicious about is not the flag — it is
the human-readable message that usually travels next to it.

This note is framework-agnostic. "Store" means whatever holds state outside a
component: a Redux-style store, a signal store, an observable service, a view
model. The argument does not change.

---

## In one minute

1. **A store cannot break the dependency rule by holding something.** It is an
   outer-ring mechanism already. The rule constrains what _points at_ what, so
   the question is "does anything inner depend on this?", not "does this smell
   like UI?" ([§1](#1-the-dependency-rule-is-about-direction-not-location))
2. **Delete the screen — what survives?** "A request is in flight" and "the last
   attempt failed" survive; a CLI or a retry policy needs them. "The accordion is
   open" does not. The first kind is interaction state and belongs in the store;
   the second is view state and stays in the component.
   ([§2](#2-three-kinds-of-state-routinely-conflated))
3. **Store the reason, render the sentence.** Failure is a legitimate use-case
   output. A localised message is not — and lifting it from `error.message` lets
   a transport or parsing detail reach the user. The application names a closed
   set of reasons; the outermost ring turns a reason into words.
   ([§3](#3-failure-is-an-output-of-the-use-case-the-copy-is-not))
4. **`{ data, isLoading, error }` permits states that cannot happen.** An
   interaction is `Idle | Loading | Loaded(data) | Failed(reason)` — one
   condition at a time. Guards defending against impossible combinations are the
   shape telling you it is a sum type.
   ([§4](#4-model-it-as-a-sum-not-a-product))
5. **The alternatives are worse.** Inferring "loading" from an empty collection
   conflates _we do not know yet_ with _there is nothing_. Keeping it in the
   component stops scaling at the second consumer. Pushing it into the use case
   is the option that genuinely breaks the dependency rule — and is what the
   original worry should have been aimed at.
   ([§5](#5-the-alternatives-and-why-they-are-worse))

If you only take one line: **the flag is fine, the message is the leak.**

---

## 1. The dependency rule is about direction, not location

The rule says inner layers must not know about outer ones. Entities know
nothing of use cases; use cases know nothing of adapters; nothing knows about
the framework.

A store — any store — is an outer-ring mechanism. It sits on the same side of
the boundary as controllers, presenters and view models. So putting something in
it cannot, by itself, break the dependency rule. Nothing inner is pointing at it.

The violation would be the _inverse_: a domain type shaped to suit a reducer, a
use case that returns a `{ data, loading }` envelope, an entity that knows a
request is pending. That is a real leak. `status: 'loading'` sitting in an outer
layer is not.

So the question to ask is **"does anything inner depend on this?"** — not
**"does this smell like UI?"** Facts do not contaminate a container by living in
it.

## 2. Three kinds of state, routinely conflated

| Kind                  | Example                                         | Where it lives             |
| --------------------- | ----------------------------------------------- | -------------------------- |
| **Domain state**      | the orders, the balance, the appointments       | the store, as domain types |
| **Interaction state** | a request is in flight; the last attempt failed | the store                  |
| **View state**        | banner dismissed, accordion open, field focused | the component              |

The test that separates the second row from the third:

> **Delete the screen. What survives?**

"A request is in flight" survives — a CLI, a scheduled job, a test harness, a
retry policy all need to know it. "The last attempt failed" survives, for the
same reason. "The accordion is open" does not; it exists only because there is a
screen.

Loading and error are firmly in the second row. They are caused by the outside
world, not by a rendering decision. Calling them "UI state" because a spinner
happens to consume them is reasoning backwards — by that argument the data is UI
state too, since a list renders it.

View state stays local for a pragmatic reason rather than an architectural one:
global state costs lifecycle management, serialization noise and cross-component
coupling, and that price only pays off when something outside the component
cares. Nobody outside cares that a banner was dismissed. Plenty of things outside
care that a request is failing.

## 3. Failure is an output of the use case; the copy is not

This is where the unease earns its keep.

Clean Architecture models failure explicitly: the output boundary carries success
_and_ failure. A use case that can fail and says so is behaving correctly. So the
store recording **"the load failed, because the source was unreachable"** is
interaction state, and it is in the right place.

The store recording **`"Sorry, we couldn't load your appointments."`** is
something else. That is a rendered artifact: someone chose a language, a
register, a capitalisation — and did it several layers away from the thing that
will display it. Consequences:

- **i18n becomes a state-layer concern.** Translating the app now means editing
  effects, sagas or services rather than templates.
- **Copy changes ripple inward.** A wording tweak from a designer touches code
  that has nothing to do with wording.
- **Infrastructure detail escapes.** When the message is lifted from whatever was
  thrown — `error.message`, an HTTP status text, a schema-validation complaint —
  a transport or parsing detail travels intact to the user's screen. That is
  precisely the leak the adapter layer exists to stop, taking the error channel
  because nobody was watching it.

The boundary, stated as a rule:

> The application names a **closed set of failure reasons**. The outermost ring
> turns a reason into words.

```
// application / state layer — a fact
type LoadFailure = 'unreachable' | 'notFound' | 'malformedResponse'

// presentation layer — a rendering of that fact
messageFor(failure)  →  localised string
```

If there is genuinely only one way a call can fail today, the honest encoding is
no reason at all — `Failed` alone carries the whole fact, and the view supplies
the sentence. The union appears when the outside world starts distinguishing
cases, and it appears in the layer that learned to distinguish them.

**Corollary:** a raw exception should not reach the store either. Adapters
translate transport and parsing failures into the application's vocabulary, the
same way they translate payloads into domain types. An error is a payload.

## 4. Model it as a sum, not a product

Flat sibling fields permit combinations that cannot occur:

```
{ data, isLoading, error }     // isLoading && error?  data && error?
```

You end up writing guards — `error && !isLoading ? …` — and those guards are the
shape telling you it is wrong. Defensive derivation is the smell, not the fix.

An interaction is in exactly one condition at a time:

```
Idle | Loading | Loaded(data) | Failed(reason)
```

Encode it that way and the impossible combinations stop being representable.
Refreshing is the one case worth deciding deliberately rather than by default: a
reload that fails can either discard what the user was reading or keep it
underneath the error. Both are defensible; `Loaded(data) + Refreshing` and
`Loaded(stale) + Failed(reason)` are the shapes that let you say which you chose.

Some store libraries generate selectors per top-level key and cope badly with
discriminated unions. That is a tooling constraint to work around — flatten if
you must — not evidence that the model is wrong.

## 5. The alternatives, and why they are worse

**Derive status from the data.** "Empty means still loading." This collapses _we
do not know yet_ and _we know, and there is nothing_ into one value. They are
different facts, and the difference is visible to users: a slow request that
renders "No results" before the response arrives is this conflation shipping to
production. An explicit status is the honest option, not the compromised one.

**Keep it in the component.** Defensible when exactly one component ever cares,
and some framework primitives (resource-style helpers) hand you status and error
colocated for free. The cost is that the call moves into the component, so the
component now knows about invocation, retries and failure translation. That is a
real trade — take it deliberately, and notice that it stops scaling the moment a
second consumer needs to know the same request is running.

**Push it inward, into the use case.** Now the interactor returns
`{ data, loading }` and the domain has learned about asynchrony and presentation
lifecycles. This is the option that actually breaks the dependency rule, and it
is the one the original worry should have been aimed at.

---

## Checklist

- [ ] Does anything **inner** depend on the loading/error state? (It must not.)
- [ ] Would this fact **survive deleting the screen**? (If yes, it is interaction
      state — the store is right.)
- [ ] Does the store hold a **reason**, or a **sentence**? (Sentences belong in
      the view.)
- [ ] Do **raw exceptions** reach the store, or does an adapter translate them
      first?
- [ ] Can the state express a **combination that cannot happen**? (If so, it is a
      sum type wearing a product's clothes.)
- [ ] Is "empty" **distinguishable from** "not loaded yet"?

## What this note does not claim

- That every flag belongs in a global store. View state should stay local.
- That a store is mandatory. Small apps live fine without one; the taxonomy still
  holds, it just maps onto different containers.
- That failure reasons must be an enum from day one. One reason is `Failed`.
