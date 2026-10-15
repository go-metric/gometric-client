import { addDays, addMonths, setHours, setMinutes, startOfWeek, subMilliseconds, subDays, subMonths } from "date-fns"
import { networks, type NetworkId } from "@/config/networks"
import { connectedAccounts, demoBrand, messages, scheduledPosts } from "@/lib/demo-data"
import type {
  AppNotification,
  Billing,
  Brand,
  Conversation,
  Post,
  SocialAccount,
  Workspace,
} from "@/lib/api/types"

export type MockDb = {
  workspace: Workspace
  accounts: SocialAccount[]
  posts: Post[]
  conversations: Conversation[]
  notifications: AppNotification[]
  billing: Billing
}

export const SEED_BRAND_ID = "brand_northwind"

const relativeAge: Record<string, number> = { m: 60_000, h: 3_600_000, d: 86_400_000 }

function parseAge(value: string) {
  const unit = value.slice(-1)
  return Number.parseInt(value, 10) * (relativeAge[unit] ?? 0)
}

function parseFollowers(value: string) {
  if (value === "—") return null
  const n = Number.parseFloat(value)
  return value.endsWith("k") ? Math.round(n * 1000) : n
}

export function disconnectedAccountsForBrand(brandId: string): SocialAccount[] {
  return (Object.keys(networks) as NetworkId[]).map((network) => ({
    brandId,
    network,
    status: "disconnected" as const,
    handle: null,
    followers: null,
    connectedAt: null,
  }))
}

/** Builds demo data around `now` so the calendar always shows the current week. */
export function createSeed(now: Date): MockDb {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const iso = (d: Date) => d.toISOString()
  const brandId = SEED_BRAND_ID

  const brand: Brand = {
    id: brandId,
    name: demoBrand.name,
    handle: demoBrand.handle,
    website: "https://northwind.co",
    industry: "retail",
    timezone: "Asia/Karachi",
  }

  const posts: Post[] = scheduledPosts.map((p) => {
    const [h, m] = p.time.split(":").map(Number)
    const at = setMinutes(setHours(addDays(weekStart, p.day), h), m)
    const isPast = at < now
    const status = p.status === "draft" ? "draft" : isPast ? "published" : "scheduled"
    return {
      id: p.id,
      brandId,
      networks: [p.network],
      body: `${p.title}\n${p.body}`,
      overrides: {},
      media: [],
      status,
      scheduledAt: status === "draft" && isPast ? null : iso(at),
      publishedAt: status === "published" ? iso(at) : null,
      createdAt: iso(subDays(at, 3)),
      updatedAt: iso(subDays(at, 1)),
    }
  })

  // Roughly one published post a day for the last three months, spread across
  // the connected networks, so top posts and "posts published" look healthy.
  const captions: Partial<Record<NetworkId, string[]>> = {
    instagram: [
      "New drop ✦: the autumn edit\nRust, olive and warm neutrals.",
      "Studio tour 🎥\nCome see where the magic happens.",
      "Styled three ways\nOne jacket, three very different weeks.",
      "Fresh off the bench\nSamples from this morning's workshop.",
      "Customer spotlight\nMeet Ana, who built her studio from scratch.",
      "Texture study\nWool, linen and a little bit of rust.",
    ],
    tiktok: [
      "Behind the scenes in the workshop\n60 seconds with the team.",
      "Packing orders at 5pm\nSatisfying, slightly chaotic.",
      "Get ready with me\nSunday reset and outfit planning.",
      "Pattern to piece\nHow a jacket gets made, fast.",
      "Unboxing the new drop\nFirst look at the autumn edit.",
    ],
    youtube: [
      "Workshop vlog\nA full day making the rust jacket.",
      "Autumn lookbook\nTwelve looks, zero filters.",
      "How we plan a drop\nOur six-week process, start to finish.",
      "Studio Q&A\nYour questions, answered.",
    ],
    linkedin: [
      "What we learned shipping weekly\nFive lessons from a busy quarter.",
      "Hiring: Design lead\nWe're growing the studio team.",
      "How we plan a drop\nFrom sketch to shelf in six weeks.",
      "Small team, big calendar\nHow we stay organised.",
    ],
    facebook: [
      "Weekend event\nJoin us Saturday at the flagship.",
      "Thank you!\nA record weekend at the store.",
      "New arrivals\nThe autumn edit is on the rails.",
    ],
    x: [
      "Thread: 5 lessons from shipping weekly",
      "Poll: favourite colourway?\nRust, olive or oat.",
      "Small studio, big autumn\nA short thread on what's next.",
    ],
    threads: ["Sunday vibes\nSlow mornings and a new playlist.", "Tiny studio update\nThe new bench has arrived."],
  }
  const rotation: NetworkId[] = [
    "instagram", "tiktok", "linkedin", "instagram", "youtube", "facebook", "x",
    "tiktok", "instagram", "threads", "linkedin", "youtube", "instagram", "x",
  ]
  const seen: Partial<Record<NetworkId, number>> = {}
  const history: { network: NetworkId; body: string; daysAgo: number }[] = []
  for (let daysAgo = 4; daysAgo <= 88; daysAgo++) {
    const network = rotation[daysAgo % rotation.length]!
    const pool = captions[network] ?? []
    const n = (seen[network] = (seen[network] ?? -1) + 1)
    history.push({ network, body: pool[n % pool.length]!, daysAgo })
  }
  history.forEach((h, i) => {
    const at = setHours(subDays(now, h.daysAgo), 10)
    posts.push({
      id: `h${i + 1}`,
      brandId,
      networks: [h.network],
      body: h.body,
      overrides: {},
      media: [],
      status: "published",
      scheduledAt: iso(at),
      publishedAt: iso(at),
      createdAt: iso(subDays(at, 2)),
      updatedAt: iso(at),
    })
  })

  const conversations: Conversation[] = messages.map((m) => {
    const sentAt = iso(subMilliseconds(now, parseAge(m.time)))
    return {
      id: m.id,
      brandId,
      network: m.network,
      kind: m.kind,
      contact: { name: m.name, initials: m.initials, color: m.color },
      postTitle: m.kind === "comment" ? (m.context.match(/“(.+)”/)?.[1] ?? null) : null,
      status: "open",
      unread: !!m.unread,
      updatedAt: sentAt,
      messages: [{ id: `${m.id}-1`, from: "contact", text: m.text, sentAt }],
    }
  })

  const accounts: SocialAccount[] = connectedAccounts.map((a) => ({
    brandId,
    network: a.network,
    status: a.status,
    handle: a.status === "disconnected" ? null : a.handle,
    followers: parseFollowers(a.followers),
    connectedAt: a.status === "disconnected" ? null : iso(subDays(now, 40)),
  }))

  const notifications: AppNotification[] = [
    {
      id: "n1",
      title: "Your autumn edit post went live",
      body: "New drop ✦ is live on Instagram and already has 1.2K likes.",
      href: "/dashboard/planner",
      createdAt: iso(subMilliseconds(now, 30 * 60_000)),
      read: false,
    },
    {
      id: "n2",
      title: "New message from Sofia Alves",
      body: "What time does Saturday start?",
      href: "/dashboard/inbox?c=m3",
      createdAt: iso(subMilliseconds(now, 60 * 60_000)),
      read: false,
    },
    {
      id: "n3",
      title: "Weekly report is ready",
      body: "Reach is up 18% compared to the previous period.",
      href: "/dashboard/analytics",
      createdAt: iso(subDays(now, 1)),
      read: true,
    },
  ]

  return {
    workspace: {
      brands: [brand],
      activeBrandId: brandId,
      profile: { name: demoBrand.owner.name, email: demoBrand.owner.email },
      notificationPrefs: {
        newDm: true,
        newComment: true,
        postPublished: false,
        postFailed: true,
        connectionExpiring: true,
        weeklyReport: false,
      },
    },
    accounts,
    posts,
    conversations,
    notifications,
    billing: createBillingSeed(now),
  }
}

/** Demo starts on Starter (10 brands) so payment method, invoices, and cancel flows are visible. */
export function createBillingSeed(now: Date): Billing {
  const iso = (d: Date) => d.toISOString()
  const periodStart = subDays(now, 12)
  const periodEnd = addMonths(periodStart, 1)

  return {
    subscription: {
      planId: "starter",
      cycle: "monthly",
      brandAllowance: 10,
      status: "active",
      currentPeriodStart: iso(periodStart),
      currentPeriodEnd: iso(periodEnd),
      cancelAtPeriodEnd: false,
      scheduledChange: null,
      trialEndsAt: null,
    },
    paymentMethod: {
      brand: "visa",
      last4: "4242",
      expMonth: 8,
      expYear: now.getFullYear() + 2,
    },
    billingDetails: {
      companyName: demoBrand.name,
      billingEmail: demoBrand.owner.email,
      country: "US",
      taxId: "",
    },
    invoices: [
      {
        id: "inv_seed_1",
        number: "INV-1003",
        description: "Starter · 10 brands · monthly",
        amount: 13,
        currency: "usd",
        status: "paid",
        issuedAt: iso(periodStart),
        paidAt: iso(periodStart),
      },
      {
        id: "inv_seed_2",
        number: "INV-1002",
        description: "Starter · 10 brands · monthly",
        amount: 13,
        currency: "usd",
        status: "paid",
        issuedAt: iso(subMonths(periodStart, 1)),
        paidAt: iso(subMonths(periodStart, 1)),
      },
      {
        id: "inv_seed_3",
        number: "INV-1001",
        description: "Starter · 10 brands · monthly",
        amount: 13,
        currency: "usd",
        status: "paid",
        issuedAt: iso(subMonths(periodStart, 2)),
        paidAt: iso(subMonths(periodStart, 2)),
      },
    ],
  }
}
