# Decisions

## 1. Random profiles and saved profiles are two different kinds of state

Saved profiles are server-owned: they can change behind our back, they need invalidation after a mutation, and they need rollback. That is what TanStack Query is for, and they live in `['savedProfiles']`.

Random profiles are not server state at all: fetched once, edited locally, never written back. They live in a small Pinia store. The alternative — writing edits into the query cache with `setQueryData` — works, but it puts mutable client state in a cache the library believes it owns, where one unintended refetch silently discards the user's edit. Splitting by *who owns the data* rather than *where it came from* made the rest fall out easily.

**Tradeoff:** two state libraries instead of one, and hand-written loading and error flags for the random fetch. The batch does not survive a hard refresh, so `/random/:externalId` reloaded directly says so plainly rather than substituting a different person.

## 2. The application owns its profile model; RandomUser stops at the boundary

`normalizeRandomUser` is the only place that knows the provider's nested shape; backend responses are folded into the same `Profile` type, so no component understands two models.

Identity is split: `id` is ours, `externalId` is `login.uuid` and carries a database `UNIQUE` constraint. That constraint is the real duplicate guard — a `findFirst` before `create` would let two concurrent requests through — so `P2002` maps to a `409`. Date of birth is stored; age and birth year are derived at render time so they cannot go stale. `UpdateProfileDto` is written by hand rather than derived with `PartialType`, so `PATCH` cannot quietly grow write access to every column.

**Tradeoff:** a mapping layer to maintain, in exchange for a swappable provider and an API that stays honest about what is editable.

## 3. Optimism is selective, not universal

Update and delete on a saved profile are optimistic with snapshot rollback: they are small, reversible, and the user is looking straight at the result.

Save is deliberately not. Creation can conflict on `externalId`, and the database is the only source of the new `id` — which the page needs in order to move to `/saved/:id`. Faking that identity to save 200ms would mean inventing data.

**Tradeoff:** Save feels slower than Update. That is the correct asymmetry, not an oversight.

## Mixed direction on the detail screen

The layout is RTL with Hebrew labels. Latin values inside it are *isolated*, not merely aligned: read-only values use `<bdi>`, the name inputs carry `dir="ltr"`, both with `unicode-bidi: isolate`. Setting `direction` alone is not enough — without isolation the bidirectional algorithm still reorders a Latin run against surrounding Hebrew, which is how a phone number's `+` ends up at the wrong end. Isolation also keeps caret movement and selection sane while editing a Latin name in an RTL form.

## Corners cut on purpose

No auth, no pagination, no backend filtering — ten rows do not need them. Filtering is client-side, synchronous and undebounced: nothing is fetched, so a delay would only make the input feel broken. There is no `GET /api/profiles/:id`; a saved detail page opened cold refetches the collection and selects by id. Delete uses a native `confirm` rather than a modal system built for one call site.

**In production:** server-side pagination, filtering and indexes; a real error contract instead of status-code mapping in the client; structured logging and tracing; integration tests against a real database in CI alongside migrations; and auth the moment profiles stop being global.

## Extension: tests on the critical path

I added tests instead of another visible feature. The backend suite covers save → list → update → delete plus the three failures the UI actually reacts to (409 duplicate, 404 missing, 400 invalid), with Prisma mocked so it runs anywhere. The frontend suite covers the provider mapper, the derived values, and filtering. I picked this over a loading or animation polish because the optimistic rollback and the derived age are exactly the places where a silent bug survives a demo. Next hour: a component test driving save-then-rollback through the real store.
