import { networkList } from "@/config/networks"
import type { BillingCycle, PlanId } from "@/config/pricing"
import { analyticsHistoryDays, plans, priceForAllowance } from "@/config/pricing"
import { http } from "@/lib/api/http"
import type { BillingDetails, BillingSnapshot } from "@/lib/api/types"

const planRank: Record<PlanId, number> = { free: 0, starter: 1, advanced: 2 }

/** Display-only plan limits; the service enforces limits and reports real usage. */
const NETWORK_CAP = networkList.length
type PlanLimits = { scheduledPosts: number | null; analyticsDays: number | null; networks: number | null }
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

export type ChangePlanInput = { planId: PlanId; cycle: BillingCycle; brandAllowance: number }
export type CancelSubscriptionInput = { keepBrandId?: string }
export type UpdatePaymentMethodInput = { number: string; expMonth: number; expYear: number }

const opts = { noBrand: true } as const

export const billingApi = {
  get: () => http.get<BillingSnapshot>("/billing", opts),
  changePlan: (input: ChangePlanInput) => http.post<BillingSnapshot>("/billing/plan", input, opts),
  cancelScheduledChange: () => http.delete<BillingSnapshot>("/billing/scheduled-change", opts),
  updatePaymentMethod: (input: UpdatePaymentMethodInput) => http.put<BillingSnapshot>("/billing/payment-method", input, opts),
  updateBillingDetails: (patch: Partial<BillingDetails>) => http.patch<BillingSnapshot>("/billing/details", patch, opts),
  cancelSubscription: (input: CancelSubscriptionInput = {}) => http.post<BillingSnapshot>("/billing/cancel", input, opts),
  resumeSubscription: () => http.post<BillingSnapshot>("/billing/resume", undefined, opts),
}

export function priceDifference(
  from: { planId: PlanId; cycle: BillingCycle; brandAllowance: number },
  to: { planId: PlanId; cycle: BillingCycle; brandAllowance: number }
) {
  return priceFor(to.planId, to.cycle, to.brandAllowance) - priceFor(from.planId, from.cycle, from.brandAllowance)
}

export { planName, priceFor, planRank }
