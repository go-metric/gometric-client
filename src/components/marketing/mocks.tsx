/**
 * Compact, illustrative product UI used on marketing pages.
 * Built from the same demo data as the dashboard so both stay in sync.
 */
import type { ComponentType, ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { ProgressBar, Sparkline } from "@/components/charts"
import { NetworkBadge, PersonAvatar } from "@/components/network"
import { TimeSeriesChart } from "@/components/time-series"
import { featureList, type FeatureId } from "@/config/features"
import { networkThemes } from "@/config/network-themes"
import { networkList, networks, type NetworkId } from "@/config/networks"
import {
  kpis,
  messages,
  networkShare,
  scheduledPosts,
  timeSlots,
  todayIndex,
  weekDays,
  impressionsSeries,
  type ScheduledPost,
} from "@/lib/demo-data"
import { cn } from "@/lib/utils"

/** Always-dark app chrome so the product reads the same in both themes. */
export function AppWindow({
  active,
  children,
  className,
}: {
  active: FeatureId
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-black/10 bg-card shadow-[0_40px_100px_-40px_rgba(31,21,18,0.45)] dark:border-white/10 dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-[#1f1512] px-3 py-2.5 text-white sm:gap-2 sm:px-5">
        <span className="mr-2 hidden size-6 items-center justify-center rounded-md bg-brand font-serif text-sm font-semibold sm:inline-flex">
          g
        </span>
        <nav className="flex min-w-0 items-center gap-0.5 overflow-hidden sm:gap-1">
          {featureList.map(({ id, label, Icon }) => (
            <span
              key={id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium sm:px-3 sm:text-xs",
                id === active ? "bg-white/12 text-white" : "text-white/55"
              )}
            >
              <Icon className="size-3.5" />
              <span className={cn(id !== active && "hidden md:inline")}>{label}</span>
            </span>
          ))}
        </nav>
        <span className="ml-auto inline-flex size-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff4d00,#ffb08a)] text-[10px] font-semibold">
          NW
        </span>
      </div>
      <div className="h-[3px] bg-[linear-gradient(90deg,#ff4d00,#ffb08a_30%,#e6f97a_55%,#8fd3ff_80%,#c4b5fd)]" />
      <div className="bg-card text-card-foreground">{children}</div>
    </div>
  )
}

/* Planner ------------------------------------------------------------ */

function MiniPostCard({ post }: { post: ScheduledPost }) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-2 text-left shadow-sm"
      style={{ borderLeft: `3px solid ${networks[post.network].color}` }}
    >
      <div className="flex items-center justify-between gap-1">
        <NetworkBadge network={post.network} className="ring-0" />
        <span className="text-[9px] font-medium text-muted-foreground">{post.time}</span>
      </div>
      <p className="mt-1.5 truncate text-[10px] leading-tight font-semibold">{post.title}</p>
      <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-muted-foreground">{post.body}</p>
    </div>
  )
}

export function PlannerMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="p-3 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium">This week</span>
        <span className="inline-flex items-center rounded-lg border border-border text-[11px] font-medium">
          <ChevronLeft className="mx-1 size-3.5 text-muted-foreground" />
          <span className="border-x border-border px-2.5 py-1">Oct 12 – 18</span>
          <ChevronRight className="mx-1 size-3.5 text-muted-foreground" />
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-semibold text-background">
          <Plus className="size-3" /> Create post
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[2.5rem_repeat(4,minmax(0,1fr))] overflow-hidden rounded-xl border border-border sm:grid-cols-[3rem_repeat(7,minmax(0,1fr))]">
        <div className="border-b border-border bg-muted/50" />
        {weekDays.map((d, i) => (
          <div
            key={d.short}
            className={cn(
              "border-b border-l border-border bg-muted/50 px-1.5 py-2 text-center text-[10px] font-semibold text-muted-foreground",
              i > 3 && "hidden sm:block",
              i === todayIndex && "bg-brand/10 text-brand"
            )}
          >
            {d.short} {d.date}
          </div>
        ))}
        {timeSlots.map((slot, s) => (
          <div key={slot} className="contents">
            <div className={cn("border-border px-1 pt-2 text-right text-[9px] text-muted-foreground", s < timeSlots.length - 1 && "border-b")}>
              {slot}
            </div>
            {weekDays.map((d, dayIndex) => {
              const post = scheduledPosts.find((p) => p.day === dayIndex && p.slot === s)
              return (
                <div
                  key={`${d.short}-${slot}`}
                  className={cn(
                    "border-l border-border p-1",
                    compact ? "min-h-16" : "min-h-20 sm:min-h-24",
                    s < timeSlots.length - 1 && "border-b",
                    dayIndex > 3 && "hidden sm:block",
                    dayIndex === todayIndex && "bg-brand/[0.04]"
                  )}
                >
                  {post ? <MiniPostCard post={post} /> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* Floating widgets ---------------------------------------------------- */

export function FollowersCard({ className }: { className?: string }) {
  const followers = kpis[0]
  return (
    <div className={cn("w-52 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xl shadow-black/10", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground">{followers.label}</p>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3" /> {followers.delta.replace("+", "")}
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{followers.value}</p>
      <Sparkline points={followers.points} className="mt-2" />
      <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
        {(["instagram", "tiktok"] as const).map((n) => (
          <span key={n} className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full" style={{ background: networks[n].color }} />
            {networks[n].name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function InboxCard({ className }: { className?: string }) {
  const unread = messages.filter((m) => m.unread)
  return (
    <div className={cn("w-64 rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-xl shadow-black/10", className)}>
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold">Inbox</p>
        <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">{unread.length} new</span>
      </div>
      <ul className="mt-2 space-y-1">
        {unread.map((m) => (
          <li key={m.id} className="flex items-start gap-2.5 rounded-xl p-1.5">
            <PersonAvatar initials={m.initials} color={m.color} network={m.network} size="sm" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold">{m.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{m.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AutoPublishPill({ className }: { className?: string }) {
  const count = scheduledPosts.filter((p) => p.status === "scheduled").length
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full bg-[#1f1512] py-1.5 pr-1.5 pl-3.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/15", className)}>
      {count} posts scheduled
      <span className="flex h-5 w-9 items-center rounded-full bg-brand p-0.5">
        <span className="ml-auto size-4 rounded-full bg-white" />
      </span>
    </div>
  )
}

/* Inbox ---------------------------------------------------------------- */

export function InboxMock() {
  const [active, ...rest] = messages
  return (
    <div className="grid min-h-80 grid-cols-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
      <div className="border-b border-border p-3 sm:border-r sm:border-b-0">
        <div className="flex gap-1.5 text-[10px] font-medium">
          <span className="rounded-full bg-foreground px-2.5 py-1 text-background">All</span>
          <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">Comments</span>
          <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">DMs</span>
        </div>
        <ul className="mt-3 space-y-1">
          {[active, ...rest.slice(0, 3)].map((m, i) => (
            <li key={m.id} className={cn("flex items-start gap-2.5 rounded-xl p-2", i === 0 && "bg-brand/8 ring-1 ring-brand/20")}>
              <PersonAvatar initials={m.initials} color={m.color} network={m.network} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold">{m.name}</p>
                  <span className="text-[9px] text-muted-foreground">{m.time}</span>
                </div>
                <p className="truncate text-[10px] text-muted-foreground">{m.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <PersonAvatar initials={active.initials} color={active.color} network={active.network} size="sm" />
          <div>
            <p className="text-xs font-semibold">{active.name}</p>
            <p className="text-[10px] text-muted-foreground">{active.context}</p>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 py-4">
          <p className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-[11px]">{active.text}</p>
          <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-brand px-3 py-2 text-[11px] text-white">
            It&apos;s back Friday at 9am — we&apos;ll DM you the link first!
          </p>
          <div className="flex gap-1.5 pt-1">
            {["Thanks! 🙌", "Link in bio", "We'll DM you"].map((r) => (
              <span key={r} className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground">{r}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
          <span className="flex-1 text-[11px] text-muted-foreground">Write a reply…</span>
          <span className="inline-flex size-6 items-center justify-center rounded-lg bg-foreground text-background">
            <Send className="size-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

/* Analytics ------------------------------------------------------------- */

const chartNetworks = ["instagram", "tiktok", "youtube"] as const

export function AnalyticsMock() {
  return (
    <div className="space-y-3 p-3 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Last 30 days</p>
        <span className="rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground">All networks</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border p-2.5 sm:p-3">
            <p className="truncate text-[10px] text-muted-foreground">{k.label}</p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <p className="text-base font-semibold tracking-tight sm:text-lg">{k.value}</p>
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{k.delta}</span>
            </div>
            <Sparkline points={k.points} className="mt-1 h-6" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold">Impressions per day, by network</p>
            <span className="text-[10px] text-muted-foreground">Last 14 days</span>
          </div>
          <TimeSeriesChart
            className="mt-2 h-36"
            points={impressionsSeries}
            series={chartNetworks.map((id) => ({ id, label: networks[id].name, color: networkThemes[id].accent }))}
          />
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-[11px] font-semibold">Top networks</p>
          <ul className="mt-3 space-y-2.5">
            {networkShare.map(({ network, share }) => (
              <li key={network} className="flex items-center gap-2">
                <NetworkBadge network={network} className="ring-0" />
                <span className="w-14 text-[10px]">{networks[network].name}</span>
                <ProgressBar value={share} color={networkThemes[network].accent} className="flex-1" />
                <span className="w-7 text-right text-[10px] text-muted-foreground">{share}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* Compose ---------------------------------------------------------------- */

const composeSelection: NetworkId[] = ["instagram", "tiktok", "linkedin"]

export function ComposeMock() {
  return (
    <div className="grid min-h-80 grid-cols-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-3 border-b border-border p-4 sm:border-r sm:border-b-0">
        <div className="flex flex-wrap gap-1.5">
          {networkList.map(({ id, Icon, tile }) => {
            const on = composeSelection.includes(id)
            return (
              <span
                key={id}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-xl",
                  on ? cn(tile, "ring-2 ring-brand ring-offset-2 ring-offset-card") : "bg-muted"
                )}
              >
                <Icon className={cn("size-4", on ? "text-white" : "text-muted-foreground")} />
              </span>
            )
          })}
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-[11px] leading-relaxed">
            The autumn edit is here 🍂 Rust, olive and warm neutrals — made to layer.
            Shop the full drop Friday at 9am.
            <span className="text-brand"> #autumnedit #newin</span>
          </p>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-2 text-muted-foreground">
            <ImageIcon className="size-3.5" />
            <Sparkles className="size-3.5 text-brand" />
            <span className="ml-auto text-[10px]">142 / 2,200</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border px-2.5 py-1.5 text-[10px]">Fri, Oct 16 · 09:00</span>
          <span className="rounded-full bg-highlight px-2 py-0.5 text-[10px] font-medium text-[#1f1512]">Best time</span>
          <span className="ml-auto rounded-lg bg-foreground px-3 py-1.5 text-[10px] font-semibold text-background">Schedule</span>
        </div>
      </div>
      <div className="flex items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-52 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 p-2.5">
            <span className="size-6 rounded-full bg-[linear-gradient(135deg,#ff4d00,#ffb08a)]" />
            <p className="text-[10px] font-semibold">northwind.studio</p>
          </div>
          <div className="aspect-square bg-[linear-gradient(135deg,#c2410c,#f59e0b_55%,#65a30d)]" />
          <div className="flex gap-2 p-2.5 text-foreground/80">
            <Heart className="size-3.5" />
            <MessageCircle className="size-3.5" />
            <Send className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

const featureMocks = {
  planner: PlannerMock,
  inbox: InboxMock,
  analytics: AnalyticsMock,
  compose: ComposeMock,
} satisfies Record<FeatureId, ComponentType>

/** The feature's mock inside the app window, with its tab active. */
export function FeatureWindow({ id, className }: { id: FeatureId; className?: string }) {
  const Mock = featureMocks[id]
  return (
    <AppWindow active={id} className={className}>
      <Mock />
    </AppWindow>
  )
}
