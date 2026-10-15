/**
 * DRAFT pricing: Metricool-shaped Free / Starter / Advanced (no Custom).
 * USD monthly amounts are ~half of Metricool's; yearly is 40% off monthly.
 * Still placeholders.
 */
export type BillingCycle = "monthly" | "yearly"

export type PlanId = "free" | "starter" | "advanced"

export type BrandTier = {
  brands: number
  price: Record<BillingCycle, number>
}

export type Plan = {
  id: PlanId
  name: string
  tagline: string
  /** Monthly / yearly price, per month. */
  price: Record<BillingCycle, number>
  cta: string
  featured?: boolean
  features: string[]
  /** Brands included in the plan. */
  maxBrands: number
  brandTiers: BrandTier[]
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Start with one brand and grow from there.",
    price: { monthly: 0, yearly: 0 },
    cta: "Create free account",
    maxBrands: 1,
    brandTiers: [{ brands: 1, price: { monthly: 0, yearly: 0 } }],
    features: [
      "Manage 1 brand",
      "1 profile per network under each brand",
      "Schedule up to 20 posts per month",
      "Unified inbox",
      "30 days of analytics history",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "For managers who post every day across brands.",
    price: { monthly: 13, yearly: 8 },
    cta: "Start with Starter",
    featured: true,
    maxBrands: 10,
    brandTiers: [{ brands: 10, price: { monthly: 13, yearly: 8 } }],
    features: [
      "Everything in Free",
      "Manage up to 10 brands",
      "Unlimited scheduled posts",
      "Unlimited analytics history",
      "PDF reports",
      "Best-time suggestions",
      "Saved replies in the inbox",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    tagline: "For agencies and teams managing many brands.",
    price: { monthly: 34, yearly: 20 },
    cta: "Start with Advanced",
    maxBrands: 50,
    brandTiers: [{ brands: 50, price: { monthly: 34, yearly: 20 } }],
    features: [
      "Everything in Starter",
      "Manage up to 50 brands",
      "Team and client management",
      "Role management",
      "Post approval system",
      "Customizable report templates",
      "Priority support",
    ],
  },
]

export function priceForAllowance(planId: PlanId, cycle: BillingCycle, brandAllowance: number) {
  const plan = plans.find((p) => p.id === planId)
  if (!plan) return 0
  const exact = plan.brandTiers.find((t) => t.brands === brandAllowance)
  return exact?.price[cycle] ?? plan.price[cycle]
}

/** Days of analytics history a plan can browse. Free keeps 30; paid plans reach back a full year. */
export function analyticsHistoryDays(planId: PlanId) {
  return planId === "free" ? 30 : 365
}

export function defaultBrandAllowance(planId: PlanId) {
  const plan = plans.find((p) => p.id === planId)
  return plan?.brandTiers[0]?.brands ?? 1
}

type Cell = boolean | string

export const comparison: { group: string; rows: { label: string; values: [Cell, Cell, Cell] }[] }[] = [
  {
    group: "Brands",
    rows: [
      { label: "Brands", values: ["1", "Up to 10", "Up to 50"] },
      { label: "1 profile per network per brand", values: [true, true, true] },
    ],
  },
  {
    group: "Planning",
    rows: [
      { label: "Scheduled posts per month", values: ["20", "Unlimited", "Unlimited"] },
      { label: "Drag-and-drop calendar", values: [true, true, true] },
      { label: "Best-time suggestions", values: [false, true, true] },
      { label: "Post approval system", values: [false, false, true] },
    ],
  },
  {
    group: "Inbox",
    rows: [
      { label: "Comments and DMs", values: [true, true, true] },
      { label: "Saved replies", values: [false, true, true] },
    ],
  },
  {
    group: "Analytics",
    rows: [
      { label: "History", values: ["30 days", "Unlimited", "Unlimited"] },
      { label: "PDF reports", values: [false, true, true] },
      { label: "Customizable report templates", values: [false, false, true] },
    ],
  },
  {
    group: "Team",
    rows: [
      { label: "Team and client management", values: [false, false, true] },
      { label: "Role management", values: [false, false, true] },
      { label: "Priority support", values: [false, false, true] },
    ],
  },
]
