/**
 * Subscription lifecycle rules for the mock backend: period-end cancellations,
 * scheduled downgrades, and brand locking. Kept free of `db.ts` imports so the
 * store itself can run it on every read and write.
 */
import { addMonths, addYears } from "date-fns"
import { defaultBrandAllowance, type BillingCycle } from "@/config/pricing"
import type { MockDb } from "@/lib/api/mock/seed"

export function periodEndFrom(start: Date, cycle: BillingCycle) {
  return cycle === "yearly" ? addYears(start, 1) : addMonths(start, 1)
}

function notify(db: MockDb, title: string, body: string) {
  db.notifications.unshift({
    id: crypto.randomUUID(),
    title,
    body,
    href: "/dashboard/settings/brands",
    createdAt: new Date().toISOString(),
    read: false,
  })
}

/**
 * Keeps at most `allowance` brands unlocked and locks the rest (view-only, never
 * deleted). `keepBrandId` wins first, then brands that are already unlocked
 * (active one first), then the remainder in creation order. Returns how many
 * brands ended up locked.
 */
export function enforceBrandAllowance(db: MockDb, allowance: number, keepBrandId?: string | null) {
  const { brands, activeBrandId } = db.workspace
  const ordered = [
    keepBrandId,
    activeBrandId,
    ...brands.filter((b) => !b.locked).map((b) => b.id),
    ...brands.map((b) => b.id),
  ].filter((id, i, all): id is string => !!id && all.indexOf(id) === i && brands.some((b) => b.id === id))

  const kept = new Set(ordered.slice(0, Math.max(allowance, 0)))
  let locked = 0
  for (const brand of brands) {
    if (kept.has(brand.id)) {
      delete brand.locked
    } else {
      brand.locked = true
      locked++
    }
  }
  return locked
}

/** Applies a due cancellation or scheduled plan change. Returns true if anything changed. */
export function applyDueChanges(db: MockDb) {
  const sub = db.billing.subscription
  const now = new Date()
  if (now < new Date(sub.currentPeriodEnd)) return false

  if (sub.cancelAtPeriodEnd) {
    const keepBrandId = sub.keepBrandId
    const allowance = defaultBrandAllowance("free")
    Object.assign(sub, {
      planId: "free" as const,
      cycle: "monthly" as const,
      brandAllowance: allowance,
      status: "canceled" as const,
      cancelAtPeriodEnd: false,
      scheduledChange: null,
      keepBrandId: null,
      trialEndsAt: null,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEndFrom(now, "monthly").toISOString(),
    })
    const locked = enforceBrandAllowance(db, allowance, keepBrandId)
    const kept = db.workspace.brands.find((b) => !b.locked)
    if (kept) db.workspace.activeBrandId = kept.id
    if (locked > 0) {
      notify(
        db,
        `${locked} brand${locked === 1 ? " is" : "s are"} now locked`,
        `Your plan moved to Free, which includes ${allowance} brand${allowance === 1 ? "" : "s"}. ${kept ? `${kept.name} stays active. ` : ""}Locked brands are kept and view-only until you upgrade.`
      )
    }
    return true
  }

  if (sub.scheduledChange) {
    const next = sub.scheduledChange
    Object.assign(sub, {
      planId: next.planId,
      cycle: next.cycle,
      brandAllowance: next.brandAllowance,
      status: "active" as const,
      scheduledChange: null,
      cancelAtPeriodEnd: false,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEndFrom(now, next.cycle).toISOString(),
    })
    const locked = enforceBrandAllowance(db, next.brandAllowance)
    if (locked > 0) {
      notify(
        db,
        `${locked} brand${locked === 1 ? " is" : "s are"} now locked`,
        "Your new plan includes fewer brands. Locked brands are kept and view-only until you upgrade."
      )
    }
    return true
  }

  return false
}
