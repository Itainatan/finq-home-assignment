# Profile Explorer — FINQ Full Stack Home Assignment

A small full-stack app: fetch ten random people, browse and filter them, open one, edit the name, and persist the ones worth keeping.

## Live

| Piece    | URL                    |
| -------- | ---------------------- |
| Frontend | _add after deployment_ |
| Backend  | _add after deployment_ |

The backend runs on a free Render instance, which sleeps when idle. The first request after a quiet period can take up to about a minute to wake it — that is the platform, not the app.

## Stack

**Frontend**
Vue 3 with the Composition API, TypeScript, Vite, Vue Router, Pinia, TanStack Vue Query, vue3-toastify. Plain scoped CSS, no UI framework.

No design was supplied, and the surface is two lists and one form. A component library brings a theme to override exactly where the risk is: the RTL detail screen, where direction-aware layout fights someone else's defaults. Scoped styles over a few tokens in `main.css` instead. The cost is that focus rings, skeletons and empty states are hand-written.

**Backend**
NestJS, TypeScript, Prisma, PostgreSQL.

**Deployment**
Vercel for the frontend, Render for the backend, Neon for the database.

## Repository structure

```
finq-home-assignment/
├── client/          Vue 3 SPA        — see client/README.md
├── server/          NestJS API       — see server/README.md
├── DECISIONS.md     the interesting choices and their tradeoffs
├── AI_USAGE.md      what AI was used for
└── README.md
```

There is no workspace tooling. The two sides are independent packages with their own `package.json`, installed and run separately.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A PostgreSQL database reachable by connection string

## Running it locally

**1. Database and backend**

```bash
cd server
npm install
cp .env.example .env          # set DATABASE_URL and FRONTEND_URL
npx prisma generate
npx prisma migrate dev        # applies the committed migration
npm run start:dev             # http://localhost:3000
```

**2. Frontend**

```bash
cd client
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3000
npm run dev                   # http://localhost:5173
```

## Tests

```bash
cd server && npm test         # API contract and error mapping, Prisma mocked
cd client && npm test         # mapper, derived values, filtering
```

## Architecture

```
Vue SPA
├── RandomUser API   (called directly from the browser)
└── NestJS API
      └── Prisma
            └── PostgreSQL
```

RandomUser is not proxied through the backend. There is no credential to hide and no server-side processing to do, so a proxy would add a hop and a deployment surface for nothing. The version is pinned at `1.4` rather than the floating latest.

The two data sources are treated as two different kinds of state, which is the central decision in this submission and is written up in `DECISIONS.md`.

## Documentation

- [`DECISIONS.md`](./DECISIONS.md) — the choices worth defending, and what was deliberately left out
- [`AI_USAGE.md`](./AI_USAGE.md) — how AI was used
