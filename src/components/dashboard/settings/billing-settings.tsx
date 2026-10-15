"use client"

import { useMemo, useState, type FormEvent } from "react"
import { format } from "date-fns"
import {
  Check,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  Minus,
} from "lucide-react"
import { toast } from "sonner"
import { ProgressBar } from "@/components/charts"
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  Panel,
  Segmented,
} from "@/components/dashboard/ui"
import { FormField } from "@/components/form-field"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { countries } from "@/config/countries"
import { comparison, defaultBrandAllowance, plans, type BillingCycle } from "@/config/pricing"
import { planName, planRank, priceDifference, priceFor } from "@/lib/api/billing"
import type {
  BillingDetails,
  BillingSnapshot,
  CardBrand,
  Invoice,
  InvoiceStatus,
  PlanId,
  SubscriptionStatus,
  UsageMeter,
} from "@/lib/api/types"
import { useNow } from "@/hooks/use-now"
import {
  useBilling,
  useCancelScheduledChange,
  useCancelSubscription,
  useChangePlan,
  useResumeSubscription,
  useUpdateBillingDetails,
  useUpdatePaymentMethod,
} from "@/lib/queries/billing"
import { cn } from "@/lib/utils"

const cycles: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

const brandLabel: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  other: "Card",
}

const subscriptionStyles: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  trialing: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  past_due: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  canceled: "bg-foreground/8 text-foreground/70",
}

const invoiceStyles: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  open: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  failed: "bg-red-500/12 text-red-700 dark:text-red-300",
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim()

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso: string) {
  return format(new Date(iso), "MMM d, yyyy")
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", className)}>{label.replace("_", " ")}</span>
}

function downloadInvoice(invoice: Invoice, details: BillingDetails) {
  const rows = [
    ["Invoice", invoice.number],
    ["Issued", formatDate(invoice.issuedAt)],
    ["Status", invoice.status],
    ["Description", invoice.description],
    ["Amount", `${invoice.amount} ${invoice.currency.toUpperCase()}`],
    ["Company", details.companyName],
    ["Email", details.billingEmail],
    ["Country", details.country],
    ["Tax ID", details.taxId || "—"],
  ]
  const csv = rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${invoice.number}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function BillingSettings() {
  const { data, error, refetch } = useBilling()
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data) return <ListSkeleton rows={8} />
  return <BillingBody billing={data} />
}

function BillingBody({ billing }: { billing: BillingSnapshot }) {
  return (
    <div className="space-y-4">
      <CurrentPlanCard billing={billing} />
      <ChangePlanSection billing={billing} />
      <Panel title="Payment & billing details">
        <PaymentMethodRow billing={billing} />
        <div className="my-6 border-t border-border" />
        <BillingDetailsForm details={billing.billingDetails} />
      </Panel>
      <InvoicesSection invoices={billing.invoices} details={billing.billingDetails} />
    </div>
  )
}

function CurrentPlanCard({ billing }: { billing: BillingSnapshot }) {
  const now = useNow()
  const { subscription } = billing
  const plan = plans.find((p) => p.id === subscription.planId)!
  const price = priceFor(subscription.planId, subscription.cycle, subscription.brandAllowance)
  const resume = useResumeSubscription()
  const cancelScheduled = useCancelScheduledChange()

  return (
    <Panel
      title="Current plan"
      action={<StatusPill label={subscription.status} className={subscriptionStyles[subscription.status]} />}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight">{plan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-4xl font-medium tracking-tight">{formatMoney(price)}</span>
            <span className="text-sm text-muted-foreground">
              / month{price > 0 && subscription.cycle === "yearly" ? ", billed yearly" : ""}
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription.brandAllowance} brand slot{subscription.brandAllowance === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
          {subscription.cancelAtPeriodEnd ? (
            <p>
              Cancels on{" "}
              <span className="font-semibold">{now ? formatDate(subscription.currentPeriodEnd) : "—"}</span>
            </p>
          ) : (
            <p>
              Renews{" "}
              <span className="font-semibold">{now ? formatDate(subscription.currentPeriodEnd) : "—"}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground capitalize">{subscription.cycle} billing</p>
        </div>
      </div>

      {subscription.scheduledChange ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Scheduled change to <span className="font-semibold">{planName(subscription.scheduledChange.planId)}</span> (
            {subscription.scheduledChange.brandAllowance} brands, {subscription.scheduledChange.cycle}) on{" "}
            {now ? formatDate(subscription.scheduledChange.effectiveAt) : "—"}
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={cancelScheduled.isPending}
            onClick={() =>
              cancelScheduled.mutate(undefined, { onSuccess: () => toast.success("Scheduled change canceled") })
            }
          >
            Keep current plan
          </Button>
        </div>
      ) : null}

      {subscription.cancelAtPeriodEnd || subscription.status === "canceled" ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {subscription.cancelAtPeriodEnd
              ? "Your plan stays active until the period ends."
              : "Your paid subscription has ended. Resume anytime to get Starter features back."}
          </p>
          <Button
            size="sm"
            variant="ink"
            disabled={resume.isPending}
            onClick={() => resume.mutate(undefined, { onSuccess: () => toast.success("Subscription resumed") })}
          >
            Resume subscription
          </Button>
        </div>
      ) : null}

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-4 text-sm font-semibold">Usage</h3>
        <UsageMeters usage={billing.usage} />
      </div>

      {subscription.planId !== "free" && !subscription.cancelAtPeriodEnd && subscription.status !== "canceled" ? (
        <div className="mt-5 border-t border-border pt-4">
          <CancelSubscription billing={billing} />
        </div>
      ) : null}
    </Panel>
  )
}

function ChangePlanSection({ billing }: { billing: BillingSnapshot }) {
  const [cycle, setCycle] = useState<BillingCycle>(billing.subscription.cycle)
  const [compareOpen, setCompareOpen] = useState(false)
  const [pending, setPending] = useState<{ planId: PlanId; cycle: BillingCycle; brandAllowance: number } | null>(null)
  const changePlan = useChangePlan()
  const { subscription } = billing

  const confirm = () => {
    if (!pending) return
    changePlan.mutate(pending, {
      onSuccess: () => {
        const upgrading =
          planRank[pending.planId] > planRank[subscription.planId] ||
          (planRank[pending.planId] === planRank[subscription.planId] &&
            pending.brandAllowance > subscription.brandAllowance)
        toast.success(
          upgrading || (pending.cycle === "yearly" && subscription.cycle === "monthly")
            ? "Plan updated"
            : "Downgrade scheduled"
        )
        setPending(null)
      },
    })
  }

  return (
    <Panel title="Change plan">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Billing cycle" options={cycles} value={cycle} onChange={setCycle} />
        {cycle === "yearly" ? (
          <span className="rounded-full bg-highlight px-2.5 py-0.5 text-[11px] font-semibold text-[#1f1512]">
            −40%
          </span>
        ) : null}
      </div>

      <ul className="grid gap-3 lg:grid-cols-3">
        {plans.map((plan) => {
          const allowance = defaultBrandAllowance(plan.id)
          const price = priceFor(plan.id, cycle, allowance)
          const current =
            plan.id === subscription.planId &&
            cycle === subscription.cycle &&
            allowance === subscription.brandAllowance
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-[1.5rem] border p-5",
                plan.featured ? "border-transparent bg-ink text-ink-foreground" : "border-border bg-card",
                current && !plan.featured && "ring-2 ring-brand/40"
              )}
            >
              {plan.featured ? (
                <span className="absolute top-4 right-4 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-brand-foreground">
                  Popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className={cn("mt-1 text-xs", plan.featured ? "text-ink-foreground/70" : "text-muted-foreground")}>
                {plan.tagline}
              </p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-medium tracking-tight">{formatMoney(price)}</span>
                <span className={cn("text-xs", plan.featured ? "text-ink-foreground/60" : "text-muted-foreground")}>
                  / mo
                </span>
              </p>
              <ul className={cn("mt-4 space-y-2 border-t pt-4 text-xs", plan.featured ? "border-white/10" : "border-border")}>
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={cn("mt-5 w-full", plan.featured && "bg-brand text-brand-foreground hover:bg-brand/90")}
                variant={plan.featured ? "default" : "ink"}
                size="sm"
                disabled={current || subscription.cancelAtPeriodEnd}
                onClick={() => setPending({ planId: plan.id, cycle, brandAllowance: allowance })}
              >
                {current ? "Current plan" : plan.id === "free" ? "Downgrade to Free" : `Choose ${plan.name}`}
              </Button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        aria-expanded={compareOpen}
        onClick={() => setCompareOpen((o) => !o)}
      >
        Compare all features
        <ChevronDown className={cn("size-4 transition-transform", compareOpen && "rotate-180")} />
      </button>
      {compareOpen ? <ComparisonTable /> : null}

      <ChangePlanDialog
        open={!!pending}
        pending={pending}
        current={{
          planId: subscription.planId,
          cycle: subscription.cycle,
          brandAllowance: subscription.brandAllowance,
        }}
        periodEnd={subscription.currentPeriodEnd}
        pendingMutation={changePlan.isPending}
        onClose={() => setPending(null)}
        onConfirm={confirm}
      />
    </Panel>
  )
}

function ComparisonTable() {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              Feature
            </th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-3 text-center font-semibold">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        {comparison.map((group) => (
          <tbody key={group.group} className="border-t border-border">
            <tr>
              <th colSpan={4} scope="colgroup" className="px-4 pt-4 pb-1 text-[11px] font-semibold tracking-[0.16em] text-foreground/60 uppercase">
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-t border-border/60">
                <th scope="row" className="px-4 py-2.5 font-normal">
                  {row.label}
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className="px-4 py-2.5 text-center">
                    {typeof v === "string" ? (
                      <span className="font-medium">{v}</span>
                    ) : v ? (
                      <Check className="mx-auto size-4 text-brand" strokeWidth={2.5} aria-label="Included" />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

function ChangePlanDialog({
  open,
  pending,
  current,
  periodEnd,
  pendingMutation,
  onClose,
  onConfirm,
}: {
  open: boolean
  pending: { planId: PlanId; cycle: BillingCycle; brandAllowance: number } | null
  current: { planId: PlanId; cycle: BillingCycle; brandAllowance: number }
  periodEnd: string
  pendingMutation: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const now = useNow()
  const diff = pending ? priceDifference(current, pending) : 0
  const upgrading = pending
    ? planRank[pending.planId] > planRank[current.planId] ||
      (planRank[pending.planId] === planRank[current.planId] && pending.brandAllowance > current.brandAllowance)
    : false
  const cycleUpgrade =
    pending?.cycle === "yearly" &&
    current.cycle === "monthly" &&
    pending.planId === current.planId &&
    pending.brandAllowance === current.brandAllowance
  const immediate = upgrading || cycleUpgrade

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {pending ? `Switch to ${planName(pending.planId)}?` : "Change plan"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pending
              ? [
                  `${pending.brandAllowance} brand slot${pending.brandAllowance === 1 ? "" : "s"}.`,
                  diff === 0
                    ? "No monthly price change."
                    : diff > 0
                      ? `About ${formatMoney(diff)} more per month.`
                      : `About ${formatMoney(Math.abs(diff))} less per month.`,
                  pending.cycle === "yearly" ? "Yearly billing applies the discounted rate." : null,
                  immediate
                    ? "This change takes effect immediately. A new billing period starts now."
                    : `This change takes effect on ${now ? formatDate(periodEnd) : "—"}. You'll keep ${planName(current.planId)} until then.`,
                ]
                  .filter(Boolean)
                  .join(" ")
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="ink" disabled={pendingMutation} onClick={onConfirm}>
            {pendingMutation ? "Updating…" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function UsageMeters({ usage }: { usage: BillingSnapshot["usage"] }) {
  const meters = [usage.brands, usage.scheduledPosts, usage.connectedNetworks, usage.analyticsHistory]
  return (
    <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {meters.map((meter) => (
        <UsageRow key={meter.label} meter={meter} />
      ))}
    </ul>
  )
}

function UsageRow({ meter }: { meter: UsageMeter }) {
  const pct = meter.limit === null ? 0 : Math.min(100, (meter.used / Math.max(meter.limit, 1)) * 100)
  const over = meter.limit !== null && meter.used > meter.limit
  return (
    <li>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{meter.label}</span>
        <span className={cn("tabular-nums text-muted-foreground", over && "font-semibold text-amber-700 dark:text-amber-300")}>
          {meter.used}
          {meter.limit === null ? (
            <span> · Unlimited</span>
          ) : (
            <span>
              {" "}
              / {meter.limit} {meter.unit}
            </span>
          )}
        </span>
      </div>
      <ProgressBar value={meter.limit === null ? Math.min(30, meter.used) : pct} color={over ? "var(--color-amber-500)" : undefined} />
    </li>
  )
}

function PaymentMethodRow({ billing }: { billing: BillingSnapshot }) {
  const [open, setOpen] = useState(false)
  const method = billing.paymentMethod
  const isFree = billing.subscription.planId === "free"

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">Payment method</h3>
      {method ? (
        <div className="flex items-center gap-4">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {brandLabel[method.brand]} ···· {method.last4}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            Update card
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {isFree ? "No card needed on the Free plan." : "Add a card to keep your paid plan active."}
          </p>
          {isFree ? null : (
            <Button size="sm" variant="ink" onClick={() => setOpen(true)}>
              Add card
            </Button>
          )}
        </div>
      )}
      <UpdateCardDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function UpdateCardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const update = useUpdatePaymentMethod()
  const [number, setNumber] = useState("")
  const [expMonth, setExpMonth] = useState("")
  const [expYear, setExpYear] = useState("")

  const reset = () => {
    setNumber("")
    setExpMonth("")
    setExpYear("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            update.mutate(
              {
                number,
                expMonth: Number(expMonth),
                expYear: Number(expYear),
              },
              {
                onSuccess: () => {
                  toast.success("Payment method updated")
                  reset()
                  onClose()
                },
              }
            )
          }}
        >
          <DialogHeader>
            <DialogTitle>Update card</DialogTitle>
            <DialogDescription>
              Demo only — we store the last four digits. Never send real card numbers to this mock.
            </DialogDescription>
          </DialogHeader>
          <FormField id="card-number" label="Card number">
            <Input
              id="card-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="card-exp-month" label="Month">
              <Input
                id="card-exp-month"
                inputMode="numeric"
                placeholder="08"
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                required
              />
            </FormField>
            <FormField id="card-exp-year" label="Year">
              <Input
                id="card-exp-year"
                inputMode="numeric"
                placeholder="2028"
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                required
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="ink" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BillingDetailsForm({ details }: { details: BillingDetails }) {
  const update = useUpdateBillingDetails()
  const formKey = useMemo(
    () => `${details.companyName}|${details.billingEmail}|${details.country}|${details.taxId}`,
    [details]
  )

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    update.mutate(
      {
        companyName: field(form, "companyName"),
        billingEmail: field(form, "billingEmail"),
        country: field(form, "country"),
        taxId: field(form, "taxId"),
      },
      { onSuccess: () => toast.success("Billing details saved") }
    )
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">Billing details</h3>
      <form key={formKey} onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="billing-company" label="Company name">
            <Input id="billing-company" name="companyName" defaultValue={details.companyName} required />
          </FormField>
          <FormField id="billing-email" label="Billing email">
            <Input id="billing-email" name="billingEmail" type="email" defaultValue={details.billingEmail} required />
          </FormField>
          <FormField id="billing-country" label="Country">
            <SearchableSelect
              id="billing-country"
              name="country"
              options={countries}
              defaultValue={details.country}
              placeholder="Search countries…"
            />
          </FormField>
          <FormField id="billing-tax" label="Tax ID" hint="Optional VAT / GST / EIN.">
            <Input id="billing-tax" name="taxId" defaultValue={details.taxId} placeholder="Optional" />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="ink" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save details"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function InvoicesSection({ invoices, details }: { invoices: Invoice[]; details: BillingDetails }) {
  return (
    <Panel title="Invoices">
      {invoices.length === 0 ? (
        <EmptyState icon={<FileText />} title="No invoices yet" description="Paid plan invoices will show up here." />
      ) : (
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-2 font-medium sm:px-6">Date</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-5 py-2 text-right font-medium sm:px-6">
                  <span className="sr-only">Download</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 whitespace-nowrap sm:px-6">{formatDate(invoice.issuedAt)}</td>
                  <td className="px-3 py-3">
                    <span className="font-medium">{invoice.number}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{invoice.description}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{formatMoney(invoice.amount)}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={invoice.status} className={invoiceStyles[invoice.status]} />
                  </td>
                  <td className="px-5 py-3 text-right sm:px-6">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Download ${invoice.number}`}
                      onClick={() => {
                        downloadInvoice(invoice, details)
                        toast.success("Invoice downloaded")
                      }}
                    >
                      <Download data-icon="inline-start" />
                      CSV
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function CancelSubscription({ billing }: { billing: BillingSnapshot }) {
  const [open, setOpen] = useState(false)
  const cancel = useCancelSubscription()
  const { subscription } = billing

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">You&apos;ll keep access until the end of the billing period.</p>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
          Cancel subscription
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {planName(subscription.planId)}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your plan stays active until {formatDate(subscription.currentPeriodEnd)}. You can resume anytime before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep plan</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Cancellation scheduled")
                    setOpen(false)
                  },
                })
              }
            >
              Confirm cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
