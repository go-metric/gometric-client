import { networkList } from "@/config/networks"
import type { BillingCycle, PlanId } from "@/config/pricing"
import { analyticsHistoryDays, plans, priceForAllowance } from "@/config/pricing"
import { api } from "@/lib/api/http"
import type { BillingDetails, BillingSnapshot } from "@/lib/api/types"

const planRank: Record<PlanId, number> = { free: 0, starter: 1, advanced: 2 }
const NETWORK_CAP = networkList.length

type PlanLimits = {
  scheduledPosts: number | null
  analyticsDays: number | null
  networks: number | null
}

/** Client-side plan caps for UI copy (server enforces the same rules). */
export const planLimits: Record<PlanId, PlanLimits> = {
  free: { scheduledPosts: 20, analyticsDays: analyticsHistoryDays("free"), networks: NETWORK_CAP },
  starter: { scheduledPosts: null, analyticsDays: null, networks: NETWORK_CAP },
  advanced: { scheduledPosts: null, analyticsDays: null, networks: NETWORK_CAP },
}

function planName(id: PlanId) {
  return plans.find((p) => p.id === id)?.name ?? id
}

function priceFor(planId: PlanId, cycle: BillingCycle, brandAllowance: number) {
  return priceForAllowance(planId, cycle, brandAllowance)
}

export type ChangePlanInput = {
  planId: PlanId
  cycle: BillingCycle
  brandAllowance: number
}

export type CancelSubscriptionInput = {
  keepBrandId?: string
}

export type UpdatePaymentMethodInput = {
  number: string
  expMonth: number
  expYear: number
}

export const billingApi = {
  get() {
    return api<BillingSnapshot>("/billing")
  },

  changePlan(input: ChangePlanInput) {
    return api<BillingSnapshot>("/billing/plan", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },

  cancelScheduledChange() {
    return api<BillingSnapshot>("/billing/scheduled-change", { method: "DELETE" })
  },

  updatePaymentMethod(input: UpdatePaymentMethodInput) {
    return api<BillingSnapshot>("/billing/payment-method", {
      method: "PUT",
      body: JSON.stringify(input),
    })
  },

  updateBillingDetails(patch: Partial<BillingDetails>) {
    return api<BillingSnapshot>("/billing/details", {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
  },

  cancelSubscription(input: CancelSubscriptionInput = {}) {
    return api<BillingSnapshot>("/billing/cancel", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },

  resumeSubscription() {
    return api<BillingSnapshot>("/billing/resume", { method: "POST" })
  },
}

export function priceDifference(
  from: { planId: PlanId; cycle: BillingCycle; brandAllowance: number },
  to: { planId: PlanId; cycle: BillingCycle; brandAllowance: number }
) {
  return priceFor(to.planId, to.cycle, to.brandAllowance) - priceFor(from.planId, from.cycle, from.brandAllowance)
}

export { planName, priceFor, planRank }
