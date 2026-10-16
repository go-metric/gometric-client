# GoMetric — Backend API requirements

This document tells the **gometric-service** team what the front end (`gometric-client`) needs, how users move through the product, and which HTTP APIs to implement.

Today the client talks to an **in-browser mock** (`localStorage`). When this service is ready, the client will swap `src/lib/api/*.ts` to `fetch` against these endpoints. Keep response shapes aligned with `gometric-client/src/lib/api/types.ts`.

---

## Product in one paragraph

GoMetric is a **multi-brand social media management** app (Metricool-shaped): connect Instagram / TikTok / YouTube / Google Business / Facebook / X / LinkedIn / Threads / Pinterest, schedule posts, reply in a unified inbox, view analytics, and manage billing.

It is **not** a crypto / wallet product. “Networks” = social platforms. “Accounts” = OAuth-linked social profiles.

---

## Architecture the client expects

```
UI (Next.js App Router)
  → TanStack Query hooks   (gometric-client/src/lib/queries/*)
    → API functions        (gometric-client/src/lib/api/*)  ← replace mock with HTTP
      → gometric-service   (this repo)
```

### Conventions

| Topic | Expectation |
|-------|-------------|
| Base URL | Client will use something like `NEXT_PUBLIC_API_BASE_URL` |
| Auth | Session cookie **or** Bearer JWT on every authenticated request |
| Active brand | Most list/write ops are scoped to the workspace’s **active brand**. Prefer `X-Active-Brand-Id` header **or** query `?brandId=`; client today stores `activeBrandId` on the workspace |
| Errors | JSON `{ "message": string }` with HTTP status. Client maps to `ApiError(message, status)` |
| Dates | ISO-8601 strings |
| IDs | Opaque strings (UUIDs fine) |
| Money | USD amounts as numbers (same units as pricing config; dollars, not cents) |

### Suggested status codes

| Code | When |
|------|------|
| `400` / `422` | Validation |
| `401` | Not authenticated |
| `403` | Forbidden (e.g. brand locked on plan, plan limit) |
| `404` | Missing resource |
| `409` | Conflict (already on plan, published post edit, etc.) |
| `507` | Optional: storage / upload quota (client mock uses this for full localStorage) |

---

## User flows (read this first)

### 1. Signup → verify → onboarding → dashboard

```
Marketing CTA
  → POST /auth/signup
  → email verification link
  → GET/POST verify
  → POST /brands  (create first brand)
  → OAuth connect per network
  → dashboard
```

**Login** skips onboarding and lands on `/dashboard` if the workspace already has a brand.

**Password reset:** request email → token link → set new password → login.

Auth screens exist in the client but are **design-only** today. Backend must implement real auth; client will replace `DemoForm` navigation.

### 2. Workspace & brands

1. User opens app → `GET /workspace` (brands, profile, notification prefs, active brand).
2. Switch brand → update active brand → client invalidates accounts, posts, inbox, analytics, billing.
3. Create / update / delete brands (enforced by plan `brandAllowance`).
4. After downgrade/cancel, excess brands may be **`locked`**: readable, not writable (posts, connects, edits return `403`).

### 3. Connect social accounts (OAuth)

1. User picks a network → redirect to provider consent.
2. Provider callback → service stores tokens → account `status: connected`.
3. Reconnect refreshes tokens; disconnect clears handle/followers and strips that network from **unpublished** posts.

Mock today fakes this with a handle field. Real flow must be OAuth.

### 4. Compose → planner → publish

1. Compose: pick connected networks, caption, per-network overrides, media, draft / schedule / publish.
2. Planner: list posts in a date range; drag to reschedule; publish now / duplicate / delete.
3. Publishing may enqueue an in-app notification if prefs allow.

### 5. Inbox

1. List conversations for active brand (comments + DMs).
2. Open thread → mark read.
3. Reply, mark done / reopen, mark unread.
4. Client polls ~60s. Saved replies are a **Starter+** feature (CRUD later; seed static replies OK for v1).

### 6. Analytics

1. Combined summary + per-network dashboards for a date range.
2. Free plan: **30 days** history; paid: effectively unlimited (client UI caps picker at 365 days today).
3. YouTube may include a `monetization` block.
4. CSV export is **client-side** today (no export API required for v1).

### 7. Billing

1. Free / Starter / Advanced; brand allowance tiers; monthly / yearly.
2. Upgrade = immediate; downgrade = scheduled to period end.
3. Cancel at period end (pick which brand stays if over Free allowance) → lock extras.
4. Resume cancels pending cancel, or restores Starter if fully canceled.
5. Payment method + billing details + invoices. Prefer Stripe (or similar); do **not** accept raw card numbers on our API long-term.

### 8. Notifications

In-app list (bell menu). Created as side effects of publish / billing / connection events. Mark one / mark all read. Client polls ~60s.

---

## Domain model (canonical)

Source of truth for TypeScript types: **`gometric-client/src/lib/api/types.ts`**.

### Networks

```
instagram | tiktok | youtube | google_business | facebook | x | linkedin | threads | pinterest
```

### Core entities

| Entity | Key fields |
|--------|------------|
| **Workspace** | `brands[]`, `activeBrandId`, `profile`, `notificationPrefs` |
| **Brand** | `id`, `name`, `handle`, `website`, `industry`, `timezone`, `locked?` |
| **Profile** | `name`, `email` |
| **SocialAccount** | `brandId`, `network`, `status` (`connected` \| `expiring` \| `disconnected`), `handle`, `followers`, `connectedAt` |
| **Post** | `brandId`, `networks[]`, `body`, `overrides`, `media[]`, `status` (`draft` \| `scheduled` \| `published`), `scheduledAt`, `publishedAt`, timestamps |
| **Conversation** | `brandId`, `network`, `kind` (`comment` \| `dm`), `contact`, `postTitle?`, `status` (`open` \| `done`), `unread`, `messages[]` |
| **AppNotification** | `title`, `body`, `href`, `createdAt`, `read` |
| **Billing** | `subscription`, `paymentMethod`, `billingDetails`, `invoices[]` + derived `usage` |

Plans: `free` \| `starter` \| `advanced`. Cycles: `monthly` \| `yearly`. See `gometric-client/src/config/pricing.ts`.

---

## Required APIs

Paths below are a **suggested REST shape**. Naming can change if the client adapters stay thin; behaviour and payloads must match.

Assume all routes below (except auth public ones) require authentication and belong to the caller’s workspace.

---

### A. Auth

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| `POST` | `/auth/signup` | `{ name, email, password }` | `{ userId }` or session | Send verification email |
| `POST` | `/auth/login` | `{ email, password }` | session / tokens | |
| `POST` | `/auth/logout` | — | `204` | |
| `POST` | `/auth/forgot-password` | `{ email }` | `204` | Always opaque success |
| `POST` | `/auth/reset-password` | `{ token, password }` | `204` | |
| `POST` | `/auth/verify-email` | `{ token }` | `204` | |
| `POST` | `/auth/resend-verification` | `{ email? }` | `204` | |
| `GET` | `/auth/me` | — | profile + workspace summary | Optional if covered by `GET /workspace` |

---

### B. Workspace

| Method | Path | Body / params | Response |
|--------|------|---------------|----------|
| `GET` | `/workspace` | — | `Workspace` |
| `POST` | `/workspace/brands` | `Omit<Brand,"id"\|"locked">` | `Workspace` |
| `PATCH` | `/workspace/brands/:brandId` | partial brand | `Workspace` |
| `DELETE` | `/workspace/brands/:brandId` | — | `Workspace` |
| `PUT` | `/workspace/active-brand` | `{ brandId }` | `Workspace` |
| `PATCH` | `/workspace/profile` | `Partial<Profile>` | `Workspace` |
| `PATCH` | `/workspace/notification-prefs` | `Partial<NotificationPrefs>` | `Workspace` |

**Notification pref keys:** `newDm`, `newComment`, `postPublished`, `postFailed`, `connectionExpiring`, `weeklyReport`.

**Rules**

- Creating a brand beyond `subscription.brandAllowance` → `403`.
- Editing a locked brand → `403`.
- Deleting the active brand moves active to another unlocked brand (or empty string if none).

---

### C. Social accounts

Scoped to **active brand** (or explicit `brandId`).

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts` | — | `SocialAccount[]` |
| `GET` | `/accounts/:network/oauth/start` | — | `{ redirectUrl }` | Start OAuth |
| `GET` | `/accounts/:network/oauth/callback` | provider query | redirect to app | Persist tokens |
| `POST` | `/accounts/:network/reconnect` | — | `SocialAccount` |
| `DELETE` | `/accounts/:network` | — | `SocialAccount` (disconnected) |

On disconnect: set disconnected; remove that network from draft/scheduled posts for the brand.

`expiring` status should be set when refresh tokens are near expiry so the UI can prompt reconnect.

---

### D. Posts

| Method | Path | Body / query | Response |
|--------|------|--------------|----------|
| `GET` | `/posts` | `from?`, `to?`, `status?` | `Post[]` |
| `GET` | `/posts/:id` | — | `Post` |
| `POST` | `/posts` | `PostInput` | `Post` |
| `PATCH` | `/posts/:id` | `Partial<PostInput>` | `Post` |
| `POST` | `/posts/:id/reschedule` | `{ scheduledAt }` | `Post` |
| `POST` | `/posts/:id/publish` | — | `Post` |
| `POST` | `/posts/:id/duplicate` | — | `Post` (new draft) |
| `DELETE` | `/posts/:id` | — | `204` |

**`PostInput`:** `{ networks, body, overrides, media, status, scheduledAt }`.

**Rules**

- Published posts cannot be edited or rescheduled (`409`).
- Reschedule requires `scheduledAt` in the future (`422`).
- Publish requires ≥1 network (`422`).
- Free plan: max **20 scheduled** posts in the current calendar month (`403` when exceeded). Count **scheduled** only, not already published.
- Media: prefer upload to CDN first (see Media), then send URLs in `media[]`. Do not expect large data URLs in production.

**Background job:** when `scheduledAt` is reached, publish to each network via provider APIs; set `status: published`, `publishedAt`; on failure respect `postFailed` notification pref.

---

### E. Media (needed for compose)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/media/upload` | multipart file | `{ id, name, url }` |

Client currently caps ~1.5 MB / 4 images in the mock. Enforce real limits server-side.

---

### F. Inbox

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/conversations` | — | `Conversation[]` (active brand) |
| `PATCH` | `/conversations/:id/unread` | `{ unread: boolean }` | `Conversation` |
| `PATCH` | `/conversations/:id/status` | `{ status: "open" \| "done" }` | `Conversation` |
| `POST` | `/conversations/:id/replies` | `{ text }` | `Conversation` |

**Rules**

- Marking read is allowed on locked brands; replies / status changes that mutate content should respect lock (`403`).
- Ingest comments/DMs from connected networks via webhooks or polling workers.

**Later (Starter+):** CRUD for saved replies. v1 can omit and let the client keep static chips.

---

### G. Notifications

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/notifications` | `AppNotification[]` |
| `POST` | `/notifications/:id/read` | `204` |
| `POST` | `/notifications/read-all` | `204` |

Create notifications from domain events (publish success/failure, billing changes, connection expiring, new DM/comment if prefs on).

---

### H. Analytics

| Method | Path | Query | Response |
|--------|------|-------|----------|
| `GET` | `/analytics/summary` | `range` (1–365 days), `end?` (yyyy-MM-dd) | `AnalyticsSummary` |
| `GET` | `/analytics/networks/:network` | same | `NetworkAnalytics` |

Window ends on `end` or today. Enforce plan history: Free = 30 days max lookback.

Payloads are large; see `types.ts` for `Kpi`, `Heatmap`, `Breakdown`, `NetworkRow`, `Monetization`, etc. Aggregate from provider insights APIs + our published posts.

---

### I. Billing

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/billing` | — | `BillingSnapshot` (`Billing` + `usage`) |
| `POST` | `/billing/plan` | `{ planId, cycle, brandAllowance }` | `BillingSnapshot` |
| `DELETE` | `/billing/scheduled-change` | — | `BillingSnapshot` |
| `PUT` | `/billing/payment-method` | Stripe setup / payment method id | `BillingSnapshot` |
| `PATCH` | `/billing/details` | `Partial<BillingDetails>` | `BillingSnapshot` |
| `POST` | `/billing/cancel` | `{ keepBrandId? }` | `BillingSnapshot` |
| `POST` | `/billing/resume` | — | `BillingSnapshot` |

**`usage` meters (derived):**

| Meter | Meaning |
|-------|---------|
| `brands` | brands used / `brandAllowance` |
| `scheduledPosts` | scheduled this month / 20 on Free, else unlimited |
| `connectedNetworks` | connected on active brand / all networks |
| `analyticsHistory` | days available / 30 on Free, else unlimited |

**Plan change rules (match client mock)**

- Same plan/cycle/allowance → `409`.
- While `cancelAtPeriodEnd` → must resume before changing (`409`).
- Cannot choose allowance &lt; current brand count (`409`).
- Upgrade (higher plan rank or more brands) or monthly→yearly same tier → **apply now**, invoice if amount &gt; 0.
- Otherwise schedule change at `currentPeriodEnd`.
- Cancel Free → `409`. Cancel paid → set `cancelAtPeriodEnd`; require `keepBrandId` if brands &gt; Free allowance.
- At period end: apply Free / scheduled change; lock brands beyond allowance (do not delete).
- Resume: clear cancel, or if already `canceled`, restore Starter monthly and unlock.

Wire to Stripe (Checkout / Customer Portal / webhooks) rather than storing PANs.

---

### J. Contact (marketing)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/contact` | `{ name, email, message }` | `204` | Optional for v1 |

---

## Plan feature matrix (enforce server-side)

| Feature | Free | Starter | Advanced |
|---------|------|---------|----------|
| Brands | 1 | up to 10 | up to 50 |
| Scheduled posts / month | 20 | Unlimited | Unlimited |
| Analytics history | 30 days | Unlimited | Unlimited |
| Unified inbox | ✓ | ✓ | ✓ |
| Best-time suggestions | — | ✓ | ✓ |
| Saved replies | — | ✓ | ✓ |
| PDF reports / team / approvals | — | partial | ✓ (later) |

Pricing numbers live in `gometric-client/src/config/pricing.ts` (still labelled draft).

---

## Suggested implementation order

1. **Auth + workspace + brands** — unblocks onboarding and shell.
2. **Accounts OAuth** — Instagram/Meta, TikTok, YouTube/Google, others as prioritized.
3. **Posts + scheduler worker + media upload** — core product loop.
4. **Inbox sync + reply** — webhooks preferred.
5. **Analytics aggregation** — can start coarse (followers, reach, engagement).
6. **Billing (Stripe)** — Free works without card; paid needs Checkout.
7. **Notifications** — event-driven once domain events exist.

---

## Client swap checklist (when APIs are live)

On the client:

1. Add `NEXT_PUBLIC_API_BASE_URL`.
2. Replace bodies of `src/lib/api/{workspace,accounts,posts,inbox,notifications,analytics,billing}.ts` with `fetch`.
3. Delete `src/lib/api/mock/`.
4. Keep `types.ts`, query hooks, and UI.
5. Replace auth `DemoForm` flows with real signup/login/session.
6. Remove Settings → Danger zone → Reset demo data (mock-only).

---

## Reference files in the client

| Concern | Path |
|---------|------|
| Types / contract | `gometric-client/src/lib/api/types.ts` |
| Current behaviour (mock) | `gometric-client/src/lib/api/*.ts` |
| Query keys / invalidation | `gometric-client/src/lib/queries/` |
| Networks | `gometric-client/src/config/networks.ts` |
| Pricing / plans | `gometric-client/src/config/pricing.ts` |
| Routes / product map | `gometric-client/src/config/site.ts` |
| Integration notes | `gometric-client/README.md` |

---

## Open questions for product / eng

1. Cookie session vs JWT (SPA-friendly) vs both?
2. Multi-user / team seats (Advanced) — schema now or later?
3. Provider priority for OAuth (which 2–3 networks first)?
4. Stripe only, or also other PSPs?
5. Should analytics be computed on read, or materialized nightly?

Update this doc when those decisions land.
