# Client — FINQ Home Assignment

Vue 3 + TypeScript + Vite. Fetches random people, lets the user save a subset, and edits saved names.

## Prerequisites

- Node.js 20 or newer (`node -v`)
- npm 10 or newer
- The backend running and reachable (see `../server/README.md`)

## Install

```bash
cd client
npm install
```

## Environment variables

Copy `.env.example` to `.env`.

| Variable            | Required | Description                                                           |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | yes      | Backend base URL with no trailing slash, e.g. `http://localhost:3000`. |

The RandomUser endpoint is not configurable: it is a public, credential-free API with a pinned version, so it is called straight from the browser.

## Running locally

```bash
npm run dev          # http://localhost:5173
npm run build        # typecheck, then production build into dist/
npm run preview      # serve the production build
```

## Tests

```bash
npm test
```

Covers the provider mapper, the derived values shown on the detail screen (age, birth year, address, full name), and the filter composable — the pure logic that a UI bug would otherwise hide.

## Screens

| Route                  | Screen                                                     |
| ---------------------- | ---------------------------------------------------------- |
| `/`                    | Home — Fetch and History                                    |
| `/random`              | The current batch of ten, filterable by name and country    |
| `/random/:externalId`  | Detail for an unsaved profile                               |
| `/saved`               | Profiles from the backend, same list and same filters       |
| `/saved/:id`           | Detail for a saved profile                                  |

`meta.source` on the route is what tells the shared detail page which profile it is looking at, so the URL always matches the actions on screen.

## Notes on the detail screen

The detail screen is RTL with Hebrew labels, as the spec asks. Latin values inside it — the editable name inputs, email, phone, house number, country — are isolated with `dir="ltr"` plus `unicode-bidi: isolate`, applied through `<bdi>` for read-only values and `dir` on the inputs. Direction alone is not enough: without isolation a Latin fragment can still be reordered by the bidirectional algorithm against the Hebrew around it, which is what makes a phone number's `+` jump to the wrong end.

## Deployment

The app is a static SPA. `vercel.json` rewrites every path to `index.html` so that a direct load or refresh of `/saved/:id` does not 404. Set `VITE_API_BASE_URL` in the Vercel project to the deployed backend URL, and add the Vercel origin to `FRONTEND_URL` on the backend.
