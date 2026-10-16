# GoMetric — Backend requirements

**Audience:** `gometric-service` / backend team  
**Owner of this doc:** frontend (`gometric-client`)  
**Canonical types:** [`src/lib/api/types.ts`](../src/lib/api/types.ts)  
**Pricing / plans:** [`src/config/pricing.ts`](../src/config/pricing.ts)  
**Networks:** [`src/config/networks.ts`](../src/config/networks.ts)

This document is the product contract the client expects. Keep HTTP responses aligned with `types.ts`. If a field or rule changes, update this doc and the types together.

---

## 1. Product summary

GoMetric is a **multi-brand social media management** product (Metricool-shaped):

- Connect social networks (Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, Pinterest)
- Schedule and publish posts
- Unified inbox (comments + DMs)
- Analytics (combined + per-network)
- Billing (Free / Starter / Advanced)

It is **not** crypto or wallets. “Networks” = social platforms. “Accounts” = OAuth-linked social profiles.

### Client architecture

```
UI (Next.js)
  → TanStack Query hooks   (src/lib/queries/*)
    → API modules          (src/lib/api/*)
      → gometric-service   (HTTP)
```

Client env:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.gometric.social
# or http://localhost:4000 for local service
```

---

## 2. Conventions (required)

| Topic | Requirement |
|-------|-------------|
| Auth | Cookie `gometric_session` **and/or** `Authorization: Bearer <accessToken>`. Client sends `credentials: "include"`. |
| Active brand | Prefer header `X-Active-Brand-Id` or query `?brandId=`. Fall back to workspace `activeBrandId`. |
| Errors | JSON `{ "message": string }` + HTTP status. |
| Dates | ISO-8601 strings |
| IDs | Opaque UUID strings |
| Money | USD **dollars** (not cents), same as pricing config |
| Empty success | `204` with no body |
| CORS | Allow client origin (`CLIENT_ORIGIN`, default `http://localhost:3000`), credentials, headers `Content-Type`, `Authorization`, `X-Active-Brand-Id` |

### Status codes

| Code | When |
|------|------|
| `400` / `422` | Validation |
| `401` | Not authenticated |
| `403` | Forbidden (unverified email, plan limit, locked brand) |
| `404` | Missing resource |
| `409` | Conflict |
| `429` | Rate limited |
| `501` | Reserved / not implemented yet |

---

## 3. User flows the API must support

### 3.1 Auth & onboarding

1. `POST /auth/signup` → verification email (no session yet)
2. User opens verify link → `POST /auth/verify-email` with token
3. `POST /auth/login` → cookie + `{ accessToken, userId }` (requires verified email)
4. Create first brand → connect networks → dashboard  
   Login with existing brands → dashboard directly

Password reset: `forgot-password` → email with token → `reset-password` → login.

Verify / reset links (dev): point at client  
`{CLIENT_ORIGIN}/verify-email?token=…` and `{CLIENT_ORIGIN}/reset-password?token=…`.

### 3.2 Workspace & brands

- Load workspace (brands, profile, prefs, active brand)
- Switch active brand (invalidates brand-scoped client data)
- CRUD brands within plan `brandAllowance`
- Locked brands (after downgrade/cancel): readable; writes return `403`

### 3.3 Social accounts

- List accounts for active brand
- OAuth start → provider consent → callback → `connected`
- Reconnect / disconnect (disconnect strips network from unpublished posts)

### 3.4 Compose → planner → publish

- Create draft / schedule / publish; edit unpublished; reschedule; publish now; duplicate; delete
- Media upload then attach URLs on the post
- Scheduler publishes due posts; respect notification prefs

### 3.5 Inbox

- List conversations; mark read/unread; open/done; reply  
- Client polls ~60s

### 3.6 Analytics

- Combined summary + per-network dashboards for a date range  
- Free: max **30 days** history  
- YouTube may include `monetization`

### 3.7 Billing

- View plan, usage, invoices, payment method, billing details
- Upgrade immediate; downgrade scheduled to period end
- Cancel at period end (`keepBrandId` when over Free allowance) → lock extras
- Resume pending cancel, or restore Starter if fully canceled

### 3.8 Notifications

- List; mark one / all read  
- Created from publish, billing, connection-expiring, inbox events (prefs)

### 3.9 Contact (marketing)

- Public contact form submit

---

## 4. Required APIs

Paths below are the contract. Response bodies must match `types.ts` unless noted.

### A. Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/auth/signup` | `{ name, email, password }` | `{ userId }` |
| `POST` | `/auth/login` | `{ email, password }` | `{ accessToken, userId }` + cookie |
| `POST` | `/auth/logout` | — | `204` |
| `POST` | `/auth/forgot-password` | `{ email }` | `204` (always opaque) |
| `POST` | `/auth/reset-password` | `{ token, password }` | `204` |
| `POST` | `/auth/verify-email` | `{ token }` | `204` |
| `POST` | `/auth/resend-verification` | `{ email? }` | `204` |
| `GET` | `/auth/me` | — | see below |

**Rules**

- Password min **8** characters
- Signup creates a Free workspace (1 brand slot); does **not** start a session
- Login requires **verified** email → otherwise `403`

**`GET /auth/me`**

```json
{
  "userId": "uuid",
  "profile": { "name": "…", "email": "…" },
  "workspace": {
    "id": "uuid",
    "activeBrandId": "uuid-or-empty",
    "brandCount": 1
  }
}
```

### B. Workspace

All authenticated. Mutating calls return full `Workspace`.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/workspace` | — | `Workspace` |
| `POST` | `/workspace/brands` | `{ name, handle?, website?, industry?, timezone? }` | `Workspace` |
| `PATCH` | `/workspace/brands/:brandId` | partial brand | `Workspace` |
| `DELETE` | `/workspace/brands/:brandId` | — | `Workspace` |
| `PUT` | `/workspace/active-brand` | `{ brandId }` | `Workspace` |
| `PATCH` | `/workspace/profile` | `{ name?, email? }` | `Workspace` |
| `PATCH` | `/workspace/notification-prefs` | partial prefs | `Workspace` |

**`Workspace`**

```ts
{
  brands: Brand[]
  activeBrandId: string  // "" when none
  profile: { name: string; email: string }
  notificationPrefs: {
    newDm: boolean
    newComment: boolean
    postPublished: boolean
    postFailed: boolean
    connectionExpiring: boolean
    weeklyReport: boolean
  }
}
```

**`Brand`**

```ts
{
  id: string
  name: string
  handle: string
  website: string
  industry: string   // retail | food | creative | services | other
  timezone: string   // IANA
  locked?: boolean
}
```

**Rules**

- Create beyond `brandAllowance` → `403`
- Edit locked brand → `403`
- Creating a brand seeds disconnected account rows for all 9 networks and sets it active
- Deleting active brand moves active to another unlocked brand, or `""`

### C. Social accounts

Scoped to active brand.

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/accounts` | `SocialAccount[]` |
| `GET` | `/accounts/:network/oauth/start` | `{ redirectUrl }` |
| `GET` | `/accounts/:network/oauth/callback` | redirect to app |
| `POST` | `/accounts/:network/reconnect` | `SocialAccount` |
| `DELETE` | `/accounts/:network` | `SocialAccount` (disconnected) |

`network`:  
`instagram` \| `tiktok` \| `youtube` \| `google_business` \| `facebook` \| `x` \| `linkedin` \| `threads` \| `pinterest`

```ts
type SocialAccount = {
  brandId: string
  network: NetworkId
  status: "connected" | "expiring" | "disconnected"
  handle: string | null
  followers: number | null
  connectedAt: string | null
}
```

After OAuth callback, redirect to something like:  
`{CLIENT_ORIGIN}/dashboard/settings/accounts?connected=:network`

### D. Posts

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/posts` | Query: `from?`, `to?`, `status?` |
| `GET` | `/posts/:id` | |
| `POST` | `/posts` | Body: `PostInput` |
| `PATCH` | `/posts/:id` | Partial `PostInput` |
| `POST` | `/posts/:id/reschedule` | `{ scheduledAt }` |
| `POST` | `/posts/:id/publish` | |
| `POST` | `/posts/:id/duplicate` | New draft |
| `DELETE` | `/posts/:id` | `204` |

```ts
type PostInput = {
  networks: NetworkId[]
  body: string
  overrides: Partial<Record<NetworkId, string>>
  media: { id: string; name: string; url: string }[]
  status: "draft" | "scheduled" | "published"
  scheduledAt: string | null
}
```

**Rules**

- Published posts: edit / reschedule → `409`
- Reschedule requires future `scheduledAt` → else `422`
- Publish requires ≥1 network → else `422`
- Free: max **20 scheduled** posts in the current calendar month → `403` when exceeded (count **scheduled**, not published)
- Background worker publishes due scheduled posts; fire `postPublished` / `postFailed` notifications per prefs

### E. Media

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/media/upload` | `multipart/form-data` field `file` | `{ id, name, url }` |

- Max ~1.5 MB; JPEG / PNG / WebP / GIF  
- Returned `url` must be absolute (usable from the client)

### F. Inbox

| Method | Path | Body |
|--------|------|------|
| `GET` | `/conversations` | — → `Conversation[]` |
| `PATCH` | `/conversations/:id/unread` | `{ unread: boolean }` |
| `PATCH` | `/conversations/:id/status` | `{ status: "open" \| "done" }` |
| `POST` | `/conversations/:id/replies` | `{ text }` → `Conversation` |

- Marking read allowed on locked brands  
- Reply / status that mutates content on locked brand → `403`  
- Shapes: `Conversation`, `ChatMessage`, `Contact` in `types.ts`

### G. Notifications

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/notifications` | `AppNotification[]` |
| `POST` | `/notifications/:id/read` | `204` |
| `POST` | `/notifications/read-all` | `204` |

```ts
type AppNotification = {
  id: string
  title: string
  body: string
  href: string
  createdAt: string
  read: boolean
}
```

### H. Analytics

| Method | Path | Query | Response |
|--------|------|-------|----------|
| `GET` | `/analytics/summary` | `range` (1–365), `end?` (`yyyy-MM-dd`) | `AnalyticsSummary` |
| `GET` | `/analytics/networks/:network` | same | `NetworkAnalytics` |

- Free plan: max **30** days lookback  
- Full payload shapes in `types.ts` (KPIs, timelines, heatmap, demographics, YouTube `monetization`, etc.)  
- CSV export is **client-side** (no export API required for v1)

### I. Billing

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/billing` | — | `BillingSnapshot` |
| `POST` | `/billing/plan` | `{ planId, cycle, brandAllowance }` | `BillingSnapshot` |
| `DELETE` | `/billing/scheduled-change` | — | `BillingSnapshot` |
| `PUT` | `/billing/payment-method` | Stripe payment method id (mock card only if explicitly allowed in env) | `BillingSnapshot` |
| `PATCH` | `/billing/details` | partial `BillingDetails` | `BillingSnapshot` |
| `POST` | `/billing/cancel` | `{ keepBrandId? }` | `BillingSnapshot` |
| `POST` | `/billing/resume` | — | `BillingSnapshot` |

Plans: `free` \| `starter` \| `advanced`  
Cycles: `monthly` \| `yearly`

**`BillingSnapshot`** = billing entity + derived `usage`:

| Meter | Meaning |
|-------|---------|
| `brands` | used / `brandAllowance` |
| `scheduledPosts` | scheduled this month / 20 on Free, else unlimited |
| `connectedNetworks` | connected on active brand / all networks |
| `analyticsHistory` | days available / 30 on Free, else unlimited |

**Plan change rules**

- Same plan/cycle/allowance → `409`
- While `cancelAtPeriodEnd` → must resume before changing → `409`
- Allowance &lt; current brand count → `409`
- Upgrade (higher plan or more brands) or monthly→yearly same tier → **apply now** + invoice if amount &gt; 0
- Otherwise schedule at `currentPeriodEnd`
- Cancel Free → `409`; cancel paid → set `cancelAtPeriodEnd`; require `keepBrandId` if brands &gt; Free allowance
- At period end: apply Free / scheduled change; **lock** brands beyond allowance (do not delete)
- Resume: clear cancel, or if `canceled` restore Starter monthly and unlock

Prefer Stripe (Checkout / Customer Portal / webhooks). Do **not** accept raw card PANs in production.

### J. Contact

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/contact` | `{ name, email, message }` | `204` |

Public.

### K. Health

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/health` | `{ "status": "ok" }` |

Public. No auth.

---

## 5. Plan feature matrix (enforce server-side)

| Feature | Free | Starter | Advanced |
|---------|------|---------|----------|
| Brands | 1 | up to 10 | up to 50 |
| Scheduled posts / month | 20 | Unlimited | Unlimited |
| Analytics history | 30 days | Unlimited* | Unlimited* |
| Unified inbox | ✓ | ✓ | ✓ |
| Best-time suggestions | — | ✓ | ✓ |
| Saved replies | — | ✓ | ✓ |
| PDF reports / team / approvals | — | partial | later |

\* Client UI may practically cap the date picker at 365 days; billing usage meter may show unlimited.

Draft prices live in `src/config/pricing.ts` (placeholders).

---

## 6. Domain types (source of truth)

Do not invent alternate JSON shapes. Implement against:

| Domain | Types file |
|--------|------------|
| Workspace / brands / prefs | `Brand`, `Profile`, `NotificationPrefs`, `Workspace` |
| Accounts | `SocialAccount`, `AccountStatus` |
| Posts | `Post`, `PostInput`, `PostMedia`, `PostStatus` |
| Inbox | `Conversation`, `ChatMessage`, `Contact` |
| Notifications | `AppNotification` |
| Analytics | `AnalyticsSummary`, `NetworkAnalytics`, `Monetization`, … |
| Billing | `BillingSnapshot`, `Subscription`, `Invoice`, `PaymentMethod`, `BillingDetails`, `BillingUsage` |

File: [`src/lib/api/types.ts`](../src/lib/api/types.ts)

---

## 7. Deferred / later (not blocking v1 client wiring)

| Item | Notes |
|------|-------|
| Real Meta / TikTok / Google / … OAuth | Mock provider OK for local; routes + token storage should stay |
| Real Stripe Checkout / Customer Portal | Payment method id shaped like Stripe |
| Saved replies CRUD | Starter+; client can use static chips for now |
| Team seats / roles / post approval | Advanced marketing features |
| PDF / customizable report templates | Later |
| Analytics from live provider insights | Deterministic / aggregated stand-in OK until then |

---

## 8. Suggested backend build order

1. Auth + workspace + brands  
2. Accounts OAuth  
3. Posts + media + scheduler worker  
4. Inbox sync + reply  
5. Analytics aggregation  
6. Billing (Stripe)  
7. Notifications (event-driven)

---

## 9. Demo / local expectations

Useful for QA with the client:

| Email | Password | Notes |
|-------|----------|-------|
| Seeded demo user (if provided by service seed) | — | Prefer a verified user on Starter with sample brands/posts |

Document the exact seed credentials in the service README when they change.

---

## 10. Open product questions

Resolve with product and note decisions here:

1. Cookie-only vs Bearer-only vs both (current preference: **both**)  
2. Multi-user / team seats timeline  
3. OAuth provider priority (which networks first in production)  
4. Stripe-only vs other PSPs  
5. Analytics computed on read vs materialized jobs  

---

## Changelog

| Date | Change |
|------|--------|
| 2026-10-16 | Initial backend requirements doc in `gometric-client` for the service team |
