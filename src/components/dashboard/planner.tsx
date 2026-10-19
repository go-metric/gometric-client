"use client"

import Link from "next/link"
import { useState, type DragEvent } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, ListOrdered, Plus } from "lucide-react"
import { toast } from "sonner"
import { errorMessage } from "@/lib/api/errors"
import { PostDialog } from "@/components/dashboard/post-dialog"
import { EmptyState, ErrorState, PageHeader, postStatusLabels, Segmented } from "@/components/dashboard/ui"
import { NetworkBadge } from "@/components/network"
import { Button, ButtonLink } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { networks } from "@/config/networks"
import { routes } from "@/config/site"
import { useBrandTimeZone } from "@/hooks/use-brand-timezone"
import { useNow } from "@/hooks/use-now"
import type { Post } from "@/lib/api/types"
import { EDITABLE_STATUSES, postDate, postTitle } from "@/lib/posts"
import { zonedParts, zonedTimeToIso } from "@/lib/tz"
import { formatInZone, formatWhenInZone } from "@/lib/tz-format"
import { usePosts, useReschedulePost } from "@/lib/queries/posts"
import { cn } from "@/lib/utils"

type View = "day" | "week" | "month" | "queue"

const WEEK = { weekStartsOn: 1 } as const
const DRAG_TYPE = "application/x-gometric-post"

function rangeFor(view: View, anchor: Date) {
  if (view === "day") return { start: startOfDay(anchor), end: startOfDay(anchor) }
  return view === "month" || view === "queue"
    ? { start: startOfWeek(startOfMonth(anchor), WEEK), end: endOfWeek(endOfMonth(anchor), WEEK) }
    : { start: startOfWeek(anchor, WEEK), end: endOfWeek(anchor, WEEK) }
}

const dateKey = (day: Date) => format(day, "yyyy-MM-dd")

function composeHref(day: Date) {
  return `${routes.dashboard.compose}?date=${format(day, "yyyy-MM-dd")}`
}

export function Planner() {
  const now = useNow()
  const [view, setView] = useState<View>("week")
  const [anchor, setAnchor] = useState<Date | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const reschedule = useReschedulePost()
  const timeZone = useBrandTimeZone()

  const current = anchor ?? now
  const range = current ? rangeFor(view, current) : null
  // Padded by a day each side: calendar days are brand-timezone days, the query bounds are UTC instants.
  const { data: posts, error, refetch } = usePosts(
    range ? { from: addDays(range.start, -1).toISOString(), to: addDays(range.end, 2).toISOString() } : {},
    { enabled: !!range && view !== "queue" }
  )
  const { data: drafts } = usePosts({ status: "draft" })
  const unscheduled = (drafts ?? []).filter((p) => !p.scheduledAt)
  const queue = usePosts({ status: "scheduled,publishing,failed,partial,published" }, { enabled: view === "queue" })
  const selected = [...(posts ?? []), ...(queue.data ?? []), ...unscheduled].find((p) => p.id === selectedId) ?? null

  const shift = (direction: 1 | -1) => {
    if (!current) return
    setAnchor(view === "day" ? addDays(current, direction) : view === "week" ? addWeeks(current, direction) : addMonths(current, direction))
  }

  const label = range
    ? view === "queue"
      ? "Everything waiting to go out, and what needs attention."
      : view === "day"
        ? format(current!, "EEEE, MMMM d, yyyy")
        : view === "week"
          ? `${format(range.start, "MMM d")} – ${format(range.end, isSameMonth(range.start, range.end) ? "d, yyyy" : "MMM d, yyyy")}`
          : format(current!, "MMMM yyyy")
    : ""

  // Which calendar day a post falls on is decided in the brand's timezone.
  const postsOn = (day: Date) =>
    (posts ?? [])
      .filter((p) => {
        const date = postDate(p)
        return date && zonedParts(date, timeZone).date === dateKey(day)
      })
      .sort((a, b) => (postDate(a) ?? "").localeCompare(postDate(b) ?? ""))

  const canDropOn = (day: Date) => !!now && dateKey(day) >= zonedParts(now, timeZone).date

  const onDrop = (event: DragEvent, day: Date) => {
    event.preventDefault()
    setDropTarget(null)
    const id = event.dataTransfer.getData(DRAG_TYPE)
    const post = [...(posts ?? []), ...unscheduled].find((p) => p.id === id)
    if (!post || !canDropOn(day)) return
    if (!EDITABLE_STATUSES.includes(post.status)) return
    // Keep the time of day (in the brand timezone); unscheduled drafts default to 09:00.
    const time = post.scheduledAt ? zonedParts(post.scheduledAt, timeZone).time : "09:00"
    const next = zonedTimeToIso(dateKey(day), time, timeZone)
    if (post.scheduledAt && next === new Date(post.scheduledAt).toISOString()) return
    if (new Date(next) <= new Date()) {
      toast.error("Pick a time in the future.")
      return
    }
    reschedule.mutate(
      { id, scheduledAt: next },
      {
        onSuccess: () => toast.success(`Moved to ${formatInZone(next, timeZone, "EEE, MMM d · HH:mm")}`),
        onError: (e) => toast.error(errorMessage(e)),
      }
    )
  }

  const dropProps = (day: Date) => {
    const key = day.toISOString()
    return {
      onDragOver: (e: DragEvent) => {
        if (!canDropOn(day) || !e.dataTransfer.types.includes(DRAG_TYPE)) return
        e.preventDefault()
        if (dropTarget !== key) setDropTarget(key)
      },
      onDragLeave: () => setDropTarget((t) => (t === key ? null : t)),
      onDrop: (e: DragEvent) => onDrop(e, day),
      "data-drop-target": dropTarget === key || undefined,
    }
  }

  return (
    <>
      <PageHeader
        title="Planner"
        description={label ? (view === "queue" ? label : `${label} · ${timeZone}`) : " "}
        actions={
          <>
            <div className={cn("inline-flex items-center rounded-xl border border-border bg-card", view === "queue" && "hidden")}>
              <Button variant="ghost" size="icon-sm" aria-label={`Previous ${view}`} onClick={() => shift(-1)}>
                <ChevronLeft />
              </Button>
              <button
                type="button"
                className="cursor-pointer px-2 text-sm font-medium hover:underline"
                onClick={() => setAnchor(null)}
              >
                Today
              </button>
              <Button variant="ghost" size="icon-sm" aria-label={`Next ${view}`} onClick={() => shift(1)}>
                <ChevronRight />
              </Button>
            </div>
            <Segmented
              label="Calendar view"
              value={view}
              onChange={setView}
              options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "queue", label: "Queue" },
              ]}
            />
            <ButtonLink variant="ink" href={routes.dashboard.compose}>
              <Plus data-icon="inline-start" />
              New post
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          {view === "queue" ? (
            <QueueView timeZone={timeZone} onSelect={setSelectedId} selectedId={selectedId} />
          ) : error ? (
            <div className="rounded-3xl border border-border bg-card">
              <ErrorState error={error} onRetry={() => refetch()} />
            </div>
          ) : !range || !posts || !now ? (
            <Skeleton className="h-[32rem] rounded-3xl" />
          ) : view === "day" ? (
            <DayView day={current!} now={now} posts={postsOn(current!)} timeZone={timeZone} dropProps={dropProps} onSelect={setSelectedId} />
          ) : view === "week" ? (
            <WeekView
              days={eachDayOfInterval(range)}
              now={now}
              postsOn={postsOn}
              dropProps={dropProps}
              canDropOn={canDropOn}
              onSelect={setSelectedId}
              timeZone={timeZone}
            />
          ) : (
            <MonthView
              days={eachDayOfInterval(range)}
              month={current!}
              now={now}
              postsOn={postsOn}
              dropProps={dropProps}
              onSelect={setSelectedId}
              timeZone={timeZone}
              onOpenDay={(day) => {
                setAnchor(day)
                setView("week")
              }}
            />
          )}
          <p className="mt-3 hidden text-xs text-muted-foreground md:block">
            Drag posts between days to reschedule. Click a post to edit, publish, or delete it.
          </p>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Unscheduled drafts</h2>
            <span className="text-xs text-muted-foreground">{unscheduled.length}</span>
          </div>
          {!drafts ? (
            <Skeleton className="mt-3 h-20 rounded-xl" />
          ) : unscheduled.length === 0 ? (
            <EmptyState
              icon={<FileText />}
              title="No drafts"
              description="Saved drafts without a date show up here."
              className="py-6"
            />
          ) : (
            <ul className="mt-3 space-y-2">
              {unscheduled.map((p) => (
                <li key={p.id}>
                  <PostChip post={p} onSelect={setSelectedId} timeZone={timeZone} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <PostDialog post={selected} onClose={() => setSelectedId(null)} />
    </>
  )
}

type DayProps = {
  timeZone: string
  now: Date
  postsOn: (day: Date) => Post[]
  dropProps: (day: Date) => Record<string, unknown>
  onSelect: (id: string) => void
}

function WeekView({ days, now, postsOn, dropProps, canDropOn, onSelect, timeZone }: DayProps & { days: Date[]; canDropOn: (day: Date) => boolean }) {
  return (
    <>
      <div className="hidden grid-cols-7 overflow-hidden rounded-3xl border border-border bg-card md:grid">
        {days.map((day, i) => {
          const today = isSameDay(day, now)
          const past = !canDropOn(day)
          const dayPosts = postsOn(day)
          return (
            <section
              key={day.toISOString()}
              aria-label={format(day, "EEEE, MMMM d")}
              className={cn(
                "group flex min-h-[28rem] flex-col transition-colors data-drop-target:bg-brand/10",
                i > 0 && "border-l border-border",
                today && "bg-brand/[0.04]",
                past && "bg-muted/40"
              )}
              {...dropProps(day)}
            >
              <header className="flex items-center justify-between border-b border-border px-2.5 py-2.5">
                <div>
                  <p className={cn("text-xs font-medium text-muted-foreground", today && "text-brand")}>{format(day, "EEE")}</p>
                  <p className={cn("text-xl font-semibold", today && "text-brand", past && "text-muted-foreground")}>
                    {format(day, "d")}
                  </p>
                </div>
                {!past ? (
                  <Link
                    href={composeHref(day)}
                    aria-label={`New post on ${format(day, "MMMM d")}`}
                    className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
                  >
                    <Plus className="size-4" />
                  </Link>
                ) : null}
              </header>
              <ul className="flex-1 space-y-2 p-2">
                {dayPosts.map((p) => (
                  <li key={p.id}>
                    <PostChip post={p} onSelect={onSelect} timeZone={timeZone} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <ol className="space-y-5 md:hidden">
        {days.map((day) => {
          const today = isSameDay(day, now)
          const dayPosts = postsOn(day)
          return (
            <li key={day.toISOString()}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className={cn("text-sm font-semibold", today && "text-brand")}>
                  {format(day, "EEE d")}
                  {today ? " · Today" : ""}
                </h2>
                {canDropOn(day) ? (
                  <Link href={composeHref(day)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                    + Add
                  </Link>
                ) : null}
              </div>
              {dayPosts.length ? (
                <ul className="space-y-2">
                  {dayPosts.map((p) => (
                    <li key={p.id}>
                      <PostChip post={p} onSelect={onSelect} timeZone={timeZone} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Nothing planned
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}

function MonthView({
  days,
  month,
  now,
  postsOn,
  dropProps,
  onSelect,
  onOpenDay,
  timeZone,
}: DayProps & { days: Date[]; month: Date; onOpenDay: (day: Date) => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border">
        {days.slice(0, 7).map((d) => (
          <p key={d.toISOString()} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {format(d, "EEEEE")}
            <span className="hidden sm:inline">{format(d, "EEEE").slice(1, 3)}</span>
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayPosts = postsOn(day)
          const today = isSameDay(day, now)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-16 border-border p-1 transition-colors data-drop-target:bg-brand/10 sm:min-h-28 sm:p-1.5",
                i % 7 !== 0 && "border-l",
                i >= 7 && "border-t",
                !isSameMonth(day, month) && "bg-muted/40 text-muted-foreground"
              )}
              {...dropProps(day)}
            >
              <button
                type="button"
                onClick={() => onOpenDay(day)}
                aria-label={`Open week of ${format(day, "MMMM d")}`}
                className={cn(
                  "inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-xs font-medium hover:bg-muted",
                  today && "bg-brand text-brand-foreground hover:bg-brand"
                )}
              >
                {format(day, "d")}
              </button>
              <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                {dayPosts.map((p) => (
                  <span key={p.id} className="size-1.5 rounded-full" style={{ background: networks[p.networks[0] ?? "x"].color }} />
                ))}
              </div>
              <ul className="mt-1 hidden space-y-1 sm:block">
                {dayPosts.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <PostChip post={p} onSelect={onSelect} timeZone={timeZone} compact />
                  </li>
                ))}
                {dayPosts.length > 3 ? (
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenDay(day)}
                      className="cursor-pointer px-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      +{dayPosts.length - 3} more
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const statusTone: Partial<Record<Post["status"], string>> = {
  failed: "border-red-500/50 bg-red-500/5",
  partial: "border-amber-500/50 bg-amber-500/5",
  publishing: "border-violet-500/40",
}

function PostChip({
  post,
  onSelect,
  timeZone,
  compact = false,
}: {
  post: Post
  onSelect: (id: string) => void
  timeZone: string
  compact?: boolean
}) {
  const date = postDate(post)
  const draggable = EDITABLE_STATUSES.includes(post.status)
  const color = networks[post.networks[0] ?? "x"].color
  const time = date ? formatInZone(date, timeZone, "HH:mm") : ""

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, post.id)
        e.dataTransfer.effectAllowed = "move"
      }}
      onClick={() => onSelect(post.id)}
      className={cn(
        "w-full cursor-pointer rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md",
        draggable && "active:cursor-grabbing",
        post.status === "draft" && "border-dashed",
        statusTone[post.status],
        compact ? "px-1.5 py-1" : "p-2.5"
      )}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {compact ? (
        <span className="flex items-center gap-1">
          {post.status === "failed" || post.status === "partial" ? <AlertTriangle className="size-3 shrink-0 text-red-600" aria-label={postStatusLabels[post.status]} /> : null}
          <span className="text-[10px] text-muted-foreground">{time}</span>
          <span className="truncate text-[11px] font-medium">{postTitle(post)}</span>
        </span>
      ) : (
        <>
          <span className="flex items-center justify-between gap-2">
            <span className="flex -space-x-1">
              {post.networks.map((n) => (
                <NetworkBadge key={n} network={n} />
              ))}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{time || "No date"}</span>
          </span>
          <span className="mt-1.5 line-clamp-2 block text-xs font-semibold">{postTitle(post)}</span>
          <span className={cn("mt-1 block text-[10px] font-semibold uppercase", post.status === "failed" ? "text-red-600" : post.status === "partial" ? "text-amber-600" : "text-muted-foreground")}>
            {postStatusLabels[post.status]}
          </span>
        </>
      )}
    </button>
  )
}

function DayView({
  day,
  now,
  posts,
  timeZone,
  dropProps,
  onSelect,
}: {
  day: Date
  now: Date
  posts: Post[]
  timeZone: string
  dropProps: (day: Date) => Record<string, unknown>
  onSelect: (id: string) => void
}) {
  const past = dateKey(day) < zonedParts(now, timeZone).date
  return (
    <section
      aria-label={format(day, "EEEE, MMMM d")}
      className="min-h-[24rem] rounded-3xl border border-border bg-card p-4 transition-colors data-drop-target:bg-brand/10"
      {...dropProps(day)}
    >
      {posts.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="Nothing planned"
          description={past ? "No posts went out on this day." : "Add a post for this day."}
          action={
            past ? undefined : (
              <ButtonLink size="sm" variant="ink" href={composeHref(day)}>
                New post
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.id} className="flex items-start gap-3">
              <span className="w-12 shrink-0 pt-2.5 text-xs font-medium text-muted-foreground">
                {postDate(p) ? formatInZone(postDate(p)!, timeZone, "HH:mm") : ""}
              </span>
              <div className="min-w-0 flex-1">
                <PostChip post={p} onSelect={onSelect} timeZone={timeZone} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Everything waiting to go out, plus failures that need a decision and recent history. */
function QueueView({ timeZone, onSelect, selectedId }: { timeZone: string; onSelect: (id: string) => void; selectedId: string | null }) {
  const now = useNow()
  const { data, error, refetch } = usePosts({ status: "scheduled,publishing,failed,partial,published" })
  if (error) {
    return (
      <div className="rounded-3xl border border-border bg-card">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    )
  }
  if (!data || !now) return <Skeleton className="h-[32rem] rounded-3xl" />

  const byDate = (a: Post, b: Post) => (postDate(a) ?? "").localeCompare(postDate(b) ?? "")
  const attention = data.filter((p) => p.status === "failed" || p.status === "partial").sort(byDate)
  const inFlight = data.filter((p) => p.status === "publishing").sort(byDate)
  const upcoming = data.filter((p) => p.status === "scheduled").sort(byDate)
  const cutoff = now.getTime() - 30 * 86_400_000
  const history = data
    .filter((p) => p.status === "published" && postDate(p) && new Date(postDate(p)!).getTime() >= cutoff)
    .sort((a, b) => byDate(b, a))
    .slice(0, 20)

  const sections: { title: string; tone?: string; posts: Post[]; empty: string }[] = [
    { title: "Needs attention", tone: "text-red-600", posts: attention, empty: "Nothing failed." },
    { title: "Publishing now", posts: inFlight, empty: "Nothing in flight." },
    { title: "Upcoming", posts: upcoming, empty: "No posts scheduled. Create one to fill the queue." },
    { title: "Recently published", posts: history, empty: "Nothing published in the last 30 days." },
  ]

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title} className="rounded-3xl border border-border bg-card p-4">
          <h2 className={cn("flex items-center gap-2 text-sm font-semibold", section.tone)}>
            <ListOrdered className="size-4" />
            {section.title}
            <span className="text-xs font-normal text-muted-foreground">{section.posts.length}</span>
          </h2>
          {section.posts.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{section.empty}</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {section.posts.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(p.id)}
                    className={cn("flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-muted/60", p.id === selectedId && "bg-muted")}
                  >
                    <span className="flex -space-x-1">
                      {p.networks.map((n) => (
                        <NetworkBadge key={n} network={n} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{postTitle(p)}</span>
                      {p.status === "failed" || p.status === "partial" ? (
                        <span className="block truncate text-xs text-destructive">
                          {p.deliveries.filter((d) => d.status === "failed").map((d) => `${networks[d.network].name}: ${d.error ?? "failed"}`).join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{postDate(p) ? formatWhenInZone(postDate(p)!, timeZone) : "No date"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
