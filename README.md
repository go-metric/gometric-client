# gometric-client

Next.js front end for gometric. Marketing site, auth/onboarding screens, and a fully interactive dashboard — all design-complete and client-functional. API calls currently hit an in-browser mock; swap them for the real service when it's ready.

## Stack

- **Next.js 16** (App Router, Cache Components)
- **React 19**, TypeScript, Tailwind v4
- **TanStack Query** for client data (`@tanstack/react-query`)
- **shadcn / Base UI**, lucide-react, framer-motion, sonner, date-fns

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## App structure

```
src/
  app/
    (marketing)/          Public pages — home, features, pricing, about, contact, legal
    (auth)/               Login, signup, password, verify
    onboarding/           Create brand → connect accounts → ready
    dashboard/            App shell (sidebar + topbar) and feature screens
  components/
    dashboard/            Feature UIs, shell pieces, shared dashboard primitives
    marketing/            Landing sections and product mocks
    ui/                   shadcn primitives
  config/                 Static site/product config (networks, features, pricing, FAQ)
  lib/
    api/                  Async API surface the UI talks to
      mock/               localStorage-backed stand-in for the backend service
    queries/              TanStack Query keys + hooks
```

## Data layer (mock → real service)

UI components never talk to storage or HTTP directly. They call hooks in `src/lib/queries/*`, which call functions in `src/lib/api/*`.

Today those API modules use `src/lib/api/mock/` (with a ~250 ms delay so loading states are visible). When the backend is ready:

1. Replace the body of each function in `src/lib/api/{posts,inbox,accounts,workspace,notifications,analytics,billing}.ts` with `fetch` / client calls to the service.
2. Delete `src/lib/api/mock/`.
3. Keep the query hooks, types in `src/lib/api/types.ts`, and the UI unchanged.

Query keys live in `src/lib/queries/keys.ts` so invalidation stays consistent across features.

Demo data resets from **Settings → Danger zone → Reset demo data**. Deleting the workspace clears everything and returns you to onboarding.

## Dashboard capabilities (client-only)

- **Overview** — live KPIs, upcoming posts, recent messages, audience
- **Planner** — week/month views, drag-and-drop reschedule, post actions (edit / publish / duplicate / delete)
- **Compose** — multi-network posting, per-network captions, media, best-time chips, draft / schedule / publish
- **Inbox** — filters, reply with saved replies, mark done / unread
- **Analytics** — range + network filters, sortable top posts, CSV export
- **Settings** — brands CRUD, profile, connect/reconnect/disconnect accounts (per brand), notification toggles, billing (Free/Starter/Advanced, brand allowance, usage, invoices)
- **Shell** — brand switcher, search (Ctrl/⌘ K), notifications menu, account menu, unread badge

## Notes

- Pricing tiers (Metricool-shaped Free / Starter / Advanced) and Privacy/Terms copy are placeholders and labelled as such.
- Multiple brands per workspace (mock); each brand has one profile per network.
- Supported networks: Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, Pinterest.
- Auth is design-only; login/signup navigate through the onboarding → dashboard flow without a real session.
