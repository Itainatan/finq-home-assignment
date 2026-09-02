# Decisions

## 1. Random and saved profiles are two different kinds of state

Saved profiles are server-owned: they change behind our back, need invalidation after a mutation, and need rollback. That is TanStack Query's job, under `['savedProfiles']`.

Random profiles are not server state — fetched once, edited locally, never written back — so they live in a small Pinia store. `setQueryData` would work, but parks mutable client state in a cache the library believes it owns, where one unintended refetch silently discards the edit. Splitting by *who owns the data* rather than *where it came from* made the rest fall out.

**Tradeoff:** two state libraries, and hand-written loading and error flags for the random fetch. The batch does not survive a refresh, so a reloaded `/random/:externalId` says so rather than showing a different person.

## 2. The app owns its profile model; RandomUser stops at the boundary

`normalizeRandomUser` is the only code that knows the provider's nested shape, and backend responses fold into the same `Profile` type, so no component understands two models.

Identity is split: `id` is ours, `externalId` is `login.uuid` under a database `UNIQUE` constraint. That constraint is the real duplicate guard — `findFirst` before `create` lets two concurrent requests through — so `P2002` maps to `409`. Date of birth is stored and age derived at render, so it cannot go stale. `UpdateProfileDto` is hand-written rather than `PartialType`, so `PATCH` cannot quietly grow write access to every column.

**Tradeoff:** a mapping layer to maintain, for a swappable provider and an API that stays honest about what is editable.

## 3. Optimism is selective

Update and delete on a saved profile are optimistic with snapshot rollback: small, reversible, and the user is watching the result. Save is not — creation can conflict on `externalId`, and the database is the only source of the new `id` the page needs to reach `/saved/:id`. Faking that identity to save 200ms means inventing data.

**Tradeoff:** Save feels slower than Update. The asymmetry is deliberate.

## Mixed direction on the detail screen

RTL layout, Hebrew labels, Latin values *isolated* rather than merely aligned. `direction` alone is not enough: without isolation the bidi algorithm reorders a Latin run against surrounding Hebrew — how a phone number's `+` lands at the wrong end. Read-only values are `<bdi>` pinned LTR. Name inputs use `dir="auto"`: the spec wants a Latin name LTR, but it is the only field a user can type Hebrew into, and `auto` serves both; CSS `direction` is unset there because it would override the attribute. Isolation also keeps caret and selection sane while editing.

## Plain CSS, not a component library

No design was supplied, and the surface is two lists and one form. A library brings a theme to override exactly where the risk is: the RTL screen, where direction-aware layout fights someone else's defaults. Scoped styles over a few tokens in `main.css` instead. **Tradeoff:** focus rings, skeletons and empty states are hand-written.

## Corners cut on purpose

No auth, no pagination, no backend filtering — ten rows do not need them. Filtering is client-side, synchronous and undebounced: nothing is fetched, so a delay would only make the input feel broken. There is no `GET /api/profiles/:id`; a cold saved detail refetches the collection and selects by id. Delete uses a native `confirm` rather than a modal system for one call site.

**In production:** server-side pagination, filtering and indexes; a real error contract instead of status-code mapping in the client; structured logging and tracing; integration tests against a real database in CI alongside migrations; and auth the moment profiles stop being global.

## Extension: tests on the critical path

I added tests rather than another visible feature. The backend suite covers save → list → update → delete plus the three failures the UI reacts to (409, 404, 400), with Prisma mocked so it runs anywhere. The frontend suite covers the mapper, the derived values and filtering. I chose this over animation polish because optimistic rollback and derived age are where a silent bug survives a demo. Next hour: a component test driving save-then-rollback through the real store.
