# gometric-client

Next.js front end for gometric. Marketing site, auth/onboarding, and dashboard.

## Stack

- **Next.js 16** (App Router, Cache Components)
- **React 19**, TypeScript, Tailwind v4
- **TanStack Query** for client data
- **shadcn / Base UI**, lucide-react, framer-motion, sonner, date-fns

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

API base URL lives in [`src/config/api.ts`](./src/config/api.ts) (default: `https://api.gometric.social`). Set `useLocal` there to hit a local service.

Seed login (service): `demo@gometric.io` / `password123`

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## App structure

```
src/
  app/
    (marketing)/          Public pages
    (auth)/               Login, signup, password, verify
    onboarding/           Create brand → connect → ready
    dashboard/            App shell and feature screens
  components/
  config/
  lib/
    api/                  HTTP clients for gometric-service
    queries/              TanStack Query keys + hooks
docs/
  BACKEND_REQUIREMENTS.md Backend-facing product/API requirements
```

## Data layer

```
UI → src/lib/queries/* → src/lib/api/* → src/config/api.ts
```

Auth uses Bearer token (localStorage or sessionStorage via “Keep me logged in”) plus `credentials: "include"` for cookies when the API origin allows them. Brand-scoped calls send `X-Active-Brand-Id`.

Backend team requirements: [`docs/BACKEND_REQUIREMENTS.md`](./docs/BACKEND_REQUIREMENTS.md).  
Service frontend contract: `gometric-service/docs/frontend-requirements.md`.

## Dashboard

- Overview, planner, compose, inbox, analytics, settings (brands, accounts, notifications, billing)
- Shell: brand switcher, search (Ctrl/⌘ K), notifications, account menu

## Notes

- Supported networks: Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, Pinterest
- **X** has real OAuth + publish on the service when configured; other networks use mock connect for now
- Pricing copy is draft
