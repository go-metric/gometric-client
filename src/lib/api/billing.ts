import { differenceInCalendarDays, startOfMonth } from "date-fns"
import { networkList } from "@/config/networks"
import type { BillingCycle, PlanId } from "@/config/pricing"
import { analyticsHistoryDays, defaultBrandAllowance, plans, priceForAllowance } from "@/config/pricing"
import { ApiError } from "@/lib/api/errors"
import { newId, nowIso, write } from "@/lib/api/mock/db"
import { applyDueChanges, enforceBrandAllowance, periodEndFrom } from "@/lib/api/mock/lifecycle"
import type { MockDb } from "@/lib/api/mock/seed"
import type {
  BillingDetails,
  BillingSnapshot,
  BillingUsage,
  CardBrand,
  Invoice,
  PaymentMethod,
  Subscription,
} from "@/lib/api/types"
import { isValidEmail } from "@/lib/validation"

const planRank: Record<PlanId, number> = { free: 0, starter: 1, advanced: 2 }

/** Every plan can connect all supported networks; caps stay in sync with `config/networks`. */
const NETWORK_CAP = networkList.length

type PlanLimits = {
  scheduledPosts: number | null
  analyticsDays: number | null
  networks: number | null
}

export const planLimits: Record<PlanId, PlanLimits> = {
  free: { scheduledPosts: 20, analyticsDays: analyticsHistoryDays("free"), networks: NETWORK_CAP },
  // Paid plans: null = unlimited in the usage meter; the picker still caps at analyticsHistoryDays.
  starter: { scheduledPosts: null, analyticsDays: null, networks: NETWORK_CAP },
  advanced: { scheduledPosts: null, analyticsDays: null, networks: NETWORK_CAP },
}

function planName(id: PlanId) {
  return plans.find((p) => p.id === id)?.name ?? id
}

function priceFor(planId: PlanId, cycle: BillingCycle, brandAllowance: number) {
  return priceForAllowance(planId, cycle, brandAllowance)
}

function pushNotification(db: MockDb, title: string, body: string) {
  db.notifications.unshift({
    id: newId(),
    title,
    body,
    href: "/dashboard/settings/billing",
    createdAt: nowIso(),
    read: false,
  })
}

function computeUsage(db: MockDb): BillingUsage {
  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const sub = db.billing.subscription
  const limits = planLimits[sub.planId]
  const brandId = db.workspace.activeBrandId

  // Free plan limit is "scheduled posts this month" — published posts don't consume the quota.
  const scheduledPosts = db.posts.filter((p) => {
    if (p.status !== "scheduled") return false
    return !!p.scheduledAt && p.scheduledAt >= monthStart
  }).length

  const connectedNetworks = db.accounts.filter(
    (a) => a.brandId === brandId && a.status !== "disconnected"
  ).length

  const oldest = db.posts
    .filter((p) => p.brandId === brandId)
    .map((p) => p.publishedAt ?? p.scheduledAt ?? p.createdAt)
    .filter(Boolean)
    .sort()[0]
  const dataDays = oldest ? Math.max(1, differenceInCalendarDays(now, new Date(oldest)) + 1) : 0
  const analyticsUsed = limits.analyticsDays === null ? dataDays : Math.min(dataDays, limits.analyticsDays)

  return {
    brands: {
      label: "Brands",
      used: db.workspace.brands.length,
      limit: sub.brandAllowance,
      unit: "brands",
    },
    scheduledPosts: {
      label: "Scheduled posts this month",
      used: scheduledPosts,
      limit: limits.scheduledPosts,
      unit: "posts",
    },
    connectedNetworks: {
      label: "Connected networks (active brand)",
      used: connectedNetworks,
      limit: limits.networks,
      unit: "networks",
    },
    analyticsHistory: {
      label: "Analytics history",
      used: analyticsUsed,
      limit: limits.analyticsDays,
      unit: "days",
    },
  }
}

function snapshot(db: MockDb): BillingSnapshot {
  return {
    ...structuredClone(db.billing),
    usage: computeUsage(db),
  }
}

function nextInvoiceNumber(db: MockDb) {
  const max = db.billing.invoices.reduce((n, inv) => {
    const match = /^INV-(\d+)$/.exec(inv.number)
    return match ? Math.max(n, Number(match[1])) : n
  }, 1000)
  return `INV-${max + 1}`
}

function addInvoice(db: MockDb, partial: Omit<Invoice, "id" | "number" | "currency">) {
  const invoice: Invoice = {
    id: newId(),
    number: nextInvoiceNumber(db),
    currency: "usd",
    ...partial,
  }
  db.billing.invoices.unshift(invoice)
  return invoice
}

function detectBrand(digits: string): CardBrand {
  if (digits.startsWith("4")) return "visa"
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "mastercard"
  if (/^3[47]/.test(digits)) return "amex"
  if (digits.startsWith("6")) return "discover"
  return "other"
}

function applyPlanNow(sub: Subscription, planId: PlanId, cycle: BillingCycle, brandAllowance: number) {
  const start = new Date()
  Object.assign(sub, {
    planId,
    cycle,
    brandAllowance,
    status: "active" as const,
    cancelAtPeriodEnd: false,
    keepBrandId: null,
    scheduledChange: null,
    trialEndsAt: null,
    currentPeriodStart: start.toISOString(),
    currentPeriodEnd: periodEndFrom(start, cycle).toISOString(),
  })
}

function assertValidAllowance(planId: PlanId, brandAllowance: number) {
  const plan = plans.find((p) => p.id === planId)
  if (!plan) throw new ApiError("Unknown plan.", 422)
  if (!plan.brandTiers.some((t) => t.brands === brandAllowance)) {
    throw new ApiError("Pick a valid brand allowance for this plan.", 422)
  }
}

export type ChangePlanInput = {
  planId: PlanId
  cycle: BillingCycle
  brandAllowance: number
}

export type CancelSubscriptionInput = {
  /** Required when the workspace has more brands than the Free plan allows. */
  keepBrandId?: string
}

export type UpdatePaymentMethodInput = {
  number: string
  expMonth: number
  expYear: number
}

export const billingApi = {
  /** Uses write so period-end cancellations / scheduled changes persist. */
  get() {
    return write((db) => {
      applyDueChanges(db)
      return snapshot(db)
    })
  },

  async changePlan({ planId, cycle, brandAllowance }: ChangePlanInput) {
    assertValidAllowance(planId, brandAllowance)

    return write((db) => {
      applyDueChanges(db)
      const sub = db.billing.subscription
      if (sub.planId === planId && sub.cycle === cycle && sub.brandAllowance === brandAllowance) {
        throw new ApiError("You're already on this plan.", 409)
      }
      if (sub.cancelAtPeriodEnd) {
        throw new ApiError("Resume your subscription before changing plans.", 409)
      }
      if (db.workspace.brands.length > brandAllowance) {
        throw new ApiError(
          `You have ${db.workspace.brands.length} brands. Remove some before switching to a ${brandAllowance}-brand allowance.`,
          409
        )
      }

      const upgrading =
        planRank[planId] > planRank[sub.planId] ||
        (planRank[planId] === planRank[sub.planId] && brandAllowance > sub.brandAllowance)
      const cycleUpgrade =
        planRank[planId] === planRank[sub.planId] &&
        brandAllowance === sub.brandAllowance &&
        cycle === "yearly" &&
        sub.cycle === "monthly"

      if (upgrading || cycleUpgrade) {
        applyPlanNow(sub, planId, cycle, brandAllowance)
        enforceBrandAllowance(db, brandAllowance)
        const amount = priceFor(planId, cycle, brandAllowance)
        if (amount > 0) {
          addInvoice(db, {
            description: `${planName(planId)} · ${brandAllowance} brands · ${cycle}`,
            amount: cycle === "yearly" ? amount * 12 : amount,
            status: "paid",
            issuedAt: nowIso(),
            paidAt: nowIso(),
          })
        }
        pushNotification(
          db,
          `Upgraded to ${planName(planId)}`,
          `Your plan is now ${planName(planId)} with ${brandAllowance} brand slot${brandAllowance === 1 ? "" : "s"} (${cycle}).`
        )
      } else {
        sub.scheduledChange = {
          planId,
          cycle,
          brandAllowance,
          effectiveAt: sub.currentPeriodEnd,
        }
        pushNotification(
          db,
          "Downgrade scheduled",
          `You'll move to ${planName(planId)} (${brandAllowance} brands, ${cycle}) on the next renewal.`
        )
      }

      return snapshot(db)
    })
  },

  async cancelScheduledChange() {
    return write((db) => {
      applyDueChanges(db)
      db.billing.subscription.scheduledChange = null
      return snapshot(db)
    })
  },

  async updatePaymentMethod(input: UpdatePaymentMethodInput) {
    const digits = input.number.replace(/\s+/g, "")
    if (!/^\d{13,19}$/.test(digits)) throw new ApiError("Enter a valid card number.", 422)
    if (input.expMonth < 1 || input.expMonth > 12) throw new ApiError("Enter a valid expiry month.", 422)
    const now = new Date()
    if (input.expYear < now.getFullYear() || (input.expYear === now.getFullYear() && input.expMonth < now.getMonth() + 1)) {
      throw new ApiError("This card has expired.", 422)
    }

    const method: PaymentMethod = {
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expMonth: input.expMonth,
      expYear: input.expYear,
    }

    return write((db) => {
      applyDueChanges(db)
      db.billing.paymentMethod = method
      if (db.billing.subscription.status === "past_due") {
        db.billing.subscription.status = "active"
      }
      return snapshot(db)
    })
  },

  async updateBillingDetails(patch: Partial<BillingDetails>) {
    if (patch.companyName !== undefined && !patch.companyName.trim()) {
      throw new ApiError("Company name is required.", 422)
    }
    if (patch.billingEmail !== undefined && !isValidEmail(patch.billingEmail)) {
      throw new ApiError("Enter a valid billing email.", 422)
    }
    if (patch.country !== undefined && !patch.country.trim()) {
      throw new ApiError("Country is required.", 422)
    }

    return write((db) => {
      applyDueChanges(db)
      Object.assign(db.billing.billingDetails, {
        ...(patch.companyName !== undefined ? { companyName: patch.companyName.trim() } : {}),
        ...(patch.billingEmail !== undefined ? { billingEmail: patch.billingEmail.trim() } : {}),
        ...(patch.country !== undefined ? { country: patch.country.trim() } : {}),
        ...(patch.taxId !== undefined ? { taxId: patch.taxId.trim() } : {}),
      })
      return snapshot(db)
    })
  },

  async cancelSubscription({ keepBrandId }: CancelSubscriptionInput = {}) {
    return write((db) => {
      applyDueChanges(db)
      const sub = db.billing.subscription
      if (sub.planId === "free") throw new ApiError("The Free plan can't be canceled.", 409)
      if (sub.cancelAtPeriodEnd) throw new ApiError("Cancellation is already scheduled.", 409)

      // Free includes fewer brands, so the user decides which one stays active.
      const brands = db.workspace.brands
      const freeAllowance = defaultBrandAllowance("free")
      let keep: string | null = brands[0]?.id ?? null
      if (brands.length > freeAllowance) {
        if (!keepBrandId || !brands.some((b) => b.id === keepBrandId)) {
          throw new ApiError("Choose which brand stays active on the Free plan.", 422)
        }
        keep = keepBrandId
      }

      sub.cancelAtPeriodEnd = true
      sub.keepBrandId = keep
      sub.scheduledChange = null
      const lockedCount = Math.max(brands.length - freeAllowance, 0)
      pushNotification(
        db,
        "Subscription canceled",
        `You'll keep ${planName(sub.planId)} until the end of the billing period.` +
          (lockedCount > 0
            ? ` Then ${lockedCount} brand${lockedCount === 1 ? "" : "s"} will be locked (view-only, not deleted).`
            : "")
      )
      return snapshot(db)
    })
  },

  async resumeSubscription() {
    return write((db) => {
      applyDueChanges(db)
      const sub = db.billing.subscription
      if (!sub.cancelAtPeriodEnd && sub.status !== "canceled") {
        throw new ApiError("There's nothing to resume.", 409)
      }
      if (sub.status === "canceled") {
        const allowance = defaultBrandAllowance("starter")
        applyPlanNow(sub, "starter", "monthly", allowance)
        enforceBrandAllowance(db, allowance)
        pushNotification(db, "Subscription resumed", "Welcome back to Starter. Your locked brands are unlocked.")
      } else {
        sub.cancelAtPeriodEnd = false
        sub.keepBrandId = null
        pushNotification(db, "Subscription resumed", `Your ${planName(sub.planId)} plan will renew as usual.`)
      }
      return snapshot(db)
    })
  },

}

export function priceDifference(
  from: { planId: PlanId; cycle: BillingCycle; brandAllowance: number },
  to: { planId: PlanId; cycle: BillingCycle; brandAllowance: number }
) {
  return priceFor(to.planId, to.cycle, to.brandAllowance) - priceFor(from.planId, from.cycle, from.brandAllowance)
}

export { planName, priceFor, planRank }
