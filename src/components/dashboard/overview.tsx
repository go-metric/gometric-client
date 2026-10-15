"use client"

import Link from "next/link"
import { CalendarPlus, Inbox, Link2 } from "lucide-react"
import { ProgressBar } from "@/components/charts"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { TimeSeriesChart } from "@/components/time-series"
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  PageHeader,
  Panel,
  PanelLink,
  PostStatusBadge,
} from "@/components/dashboard/ui"
import { Accent } from "@/components/marketing/primitives"
import { NetworkBadge, NetworkTile, PersonAvatar } from "@/components/network"
import { ButtonLink } from "@/components/ui/button"
import { networkThemes } from "@/config/network-themes"
import { networks } from "@/config/networks"
import { routes } from "@/config/site"
import { useNow } from "@/hooks/use-now"
import { formatAgo, formatCompact, formatTime } from "@/lib/format"
import { postExcerpt, postTitle } from "@/lib/posts"
import { useAnalytics } from "@/lib/queries/analytics"
import { useConversations } from "@/lib/queries/inbox"
import { usePosts } from "@/lib/queries/posts"
import { useWorkspace } from "@/lib/queries/workspace"
import { format } from "date-fns"

function greeting(now: Date | null) {
  if (!now) return "Hello"
  const hour = now.getHours()
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
}

export function Overview() {
  const now = useNow()
  const { data: workspace } = useWorkspace()
  const analytics = useAnalytics({ range: 30 })
  const firstName = workspace?.profile.name.split(" ")[0]

  return (
    <>
      <PageHeader
        title={
          <>
            {greeting(now)}
            {firstName ? (
              <>
                , <Accent>{firstName}</Accent>
              </>
            ) : null}
          </>
        }
        description="Here's how your brand is doing over the last 30 days."
      />

      <KpiCards kpis={analytics.data?.kpis.slice(0, 4)} />

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <UpcomingPosts />
        <RecentMessages />

        <Panel
          title="Impressions per day"
          action={<PanelLink href={routes.dashboard.analytics}>Analytics</PanelLink>}
          className="xl:col-span-2"
        >
          {analytics.data ? (
            <TimeSeriesChart
              points={analytics.data.impressions.map((d) => ({ label: d.label, detail: d.detail, values: { v: d.value } }))}
              series={[{ id: "v", label: "Impressions", color: "#ff4d00" }]}
              className="h-52 sm:h-60"
            />
          ) : analytics.error ? (
            <ErrorState error={analytics.error} onRetry={() => analytics.refetch()} />
          ) : (
            <div className="h-52 animate-pulse rounded-2xl bg-muted sm:h-60" />
          )}
        </Panel>

        <Panel title="Audience by network">
          {!analytics.data ? (
            <ListSkeleton rows={4} />
          ) : analytics.data.audience.length === 0 ? (
            <EmptyState
              icon={<Link2 />}
              title="No networks linked"
              action={
                <ButtonLink size="sm" variant="ink" href={routes.dashboard.accounts}>
                  Connect accounts
                </ButtonLink>
              }
            />
          ) : (
            <ul className="space-y-4">
              {analytics.data.audience.map((a) => (
                <li key={a.network}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <NetworkBadge network={a.network} className="ring-0" />
                      {networks[a.network].name}
                    </span>
                    <span className="text-muted-foreground">{formatCompact(a.followers)}</span>
                  </div>
                  <ProgressBar value={a.share} color={networkThemes[a.network].accent} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}

function UpcomingPosts() {
  const now = useNow()
  const { data: posts, error, refetch } = usePosts({ status: "scheduled" })
  const upcoming = now ? (posts ?? []).filter((p) => p.scheduledAt && new Date(p.scheduledAt) > now).slice(0, 5) : []

  return (
    <Panel
      title="Upcoming posts"
      action={<PanelLink href={routes.dashboard.planner}>Open planner</PanelLink>}
      className="xl:col-span-2"
    >
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !posts || !now ? (
        <ListSkeleton rows={4} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarPlus />}
          title="Nothing scheduled"
          description="Plan your next post to keep the week busy."
          action={
            <ButtonLink size="sm" variant="ink" href={routes.dashboard.compose}>
              Create post
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-border">
          {upcoming.map((post) => {
            const at = new Date(post.scheduledAt!)
            return (
              <li key={post.id}>
                <Link
                  href={`${routes.dashboard.compose}?post=${post.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted/60 sm:gap-4"
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">{format(at, "EEE")}</p>
                    <p className="text-lg leading-tight font-semibold">{format(at, "d")}</p>
                  </div>
                  <div className="flex -space-x-1.5">
                    {post.networks.map((n) => (
                      <NetworkTile key={n} network={n} size="sm" className="ring-2 ring-card" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{postTitle(post)}</p>
                    <p className="truncate text-xs text-muted-foreground">{postExcerpt(post)}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">{formatTime(post.scheduledAt!)}</p>
                    <PostStatusBadge status={post.status} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

function RecentMessages() {
  const { data, error, refetch } = useConversations()
  const recent = (data ?? []).filter((c) => c.status === "open").slice(0, 4)

  return (
    <Panel title="Recent messages" action={<PanelLink href={routes.dashboard.inbox}>Inbox</PanelLink>}>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <ListSkeleton rows={4} />
      ) : recent.length === 0 ? (
        <EmptyState icon={<Inbox />} title="Inbox zero" description="No open conversations right now." />
      ) : (
        <ul className="space-y-1">
          {recent.map((c) => (
            <li key={c.id}>
              <Link
                href={`${routes.dashboard.inbox}?c=${c.id}`}
                className="-mx-2 flex items-start gap-3 rounded-2xl p-2 hover:bg-muted/60"
              >
                <PersonAvatar initials={c.contact.initials} color={c.contact.color} network={c.network} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{c.contact.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{formatAgo(c.updatedAt)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.messages.at(-1)?.text}</p>
                </div>
                {c.unread ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
