# Server — FINQ Home Assignment

NestJS + TypeScript + Prisma + PostgreSQL. Persists the profiles the user chose to save.

## Prerequisites

- Node.js 20 or newer (`node -v`)
- npm 10 or newer
- A PostgreSQL database. Anything reachable over a connection string works: a local Postgres, Docker, or a hosted instance such as Neon.

## Install

```bash
cd server
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill it in.

| Variable       | Required | Description                                                                                          |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | yes      | PostgreSQL connection string. For Neon, append `?sslmode=require`.                                     |
| `FRONTEND_URL` | yes      | Comma separated list of browser origins allowed by CORS, e.g. `http://localhost:5173,https://x.vercel.app`. |
| `PORT`         | no       | Defaults to `3000`. Render injects this automatically — do not hardcode it there.                      |

## Database setup

```bash
npx prisma generate          # generate the typed client
npx prisma migrate dev       # create the local schema from prisma/migrations
```

Migrations are committed, so production uses `npx prisma migrate deploy` instead. Schema push is deliberately not used: it would make deployments non-reproducible.

## Running locally

```bash
npm run start:dev            # watch mode, http://localhost:3000
npm run start:prod           # runs migrate deploy, then the compiled server
```

## Tests

```bash
npm test
```

The suite covers the full save → list → update → delete path plus the failure modes the UI reacts to: `409` on a duplicate profile, `404` on a missing one, and `400` on invalid or non-whitelisted input. Prisma is mocked, so the suite needs no database and runs in CI. That tradeoff is deliberate and is written up in `../DECISIONS.md`.

## API

All profile routes live under `/api`. `/health` is intentionally outside it — it is deployment infrastructure, not business functionality.

| Method   | Path                 | Success | Notes                                                        |
| -------- | -------------------- | ------- | ------------------------------------------------------------ |
| `GET`    | `/api/profiles`      | `200`   | Returns `[]` when empty, never `404`. No pagination.          |
| `POST`   | `/api/profiles`      | `201`   | Returns the saved profile including its database `id`.        |
| `PATCH`  | `/api/profiles/:id`  | `200`   | Accepts `firstName` and `lastName` only.                      |
| `DELETE` | `/api/profiles/:id`  | `204`   | No response body.                                             |
| `GET`    | `/health`            | `200`   | `{ "status": "ok" }`                                          |

Errors: `400` invalid payload, `404` unknown profile, `409` a profile with that `externalId` is already saved.

There is deliberately no `GET /api/profiles/:id`. A saved detail page opened directly refetches the collection and selects by id — at this dataset size that keeps the API surface smaller without any real cost.

## Notes on design

- **One table.** Address and image fields are columns, not normalized relations. Normalizing here would buy nothing.
- **Two identities.** `id` is application-owned; `externalId` is the RandomUser identity and carries the `UNIQUE` constraint. The constraint is the real guard against duplicates — a `findFirst` check before `create` would let two concurrent requests through.
- **Date of birth, not age.** Age is derived at render time so it cannot go stale.
- **`streetNumber` is a string.** It is an address fragment, never arithmetic.
- **`UpdateProfileDto` is written out explicitly** rather than derived from the create DTO with `PartialType`, so PATCH cannot silently grow write access to every column.
