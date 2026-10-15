"use client"

import Link from "next/link"
import { useState, type DragEvent } from "react"
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, FileText, Plus } from "lucide-react"
import { toast } from "sonner"
import { PostDialog } from "@/components/dashboard/post-dialog"
import { EmptyState, ErrorState, PageHeader, Segmented } from "@/components/dashboard/ui"
import { NetworkBadge } from "@/components/network"
import { Button, ButtonLink } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { networks } from "@/config/networks"
import { routes } from "@/config/site"
import { useNow } from "@/hooks/use-now"
import type { Post } from "@/lib/api/types"
import { formatTime } from "@/lib/format"
import { postDate, postTitle } from "@/lib/posts"
import { usePosts, useReschedulePost } from "@/lib/queries/posts"
import { cn } from "@/lib/utils"

type View = "week" | "month"

const WEEK = { weekStartsOn: 1 } as const
const DRAG_TYPE = "application/x-gometric-post"

function rangeFor(view: View, anchor: Date) {
  return view === "week"
    ? { start: startOfWeek(anchor, WEEK), end: endOfWeek(anchor, WEEK) }
    : { start: startOfWeek(startOfMonth(anchor), WEEK), end: endOfWeek(endOfMonth(anchor), WEEK) }
}

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

  const current = anchor ?? now
  const range = current ? rangeFor(view, current) : null
  const { data: posts, error, refetch } = usePosts(
    range ? { from: range.start.toISOString(), to: range.end.toISOString() } : {},
    { enabled: !!range }
  )
  const { data: drafts } = usePosts({ status: "draft" })
  const unscheduled = (drafts ?? []).filter((p) => !p.scheduledAt)
  const selected = [...(posts ?? []), ...unscheduled].find((p) => p.id === selectedId) ?? null

  const shift = (direction: 1 | -1) => {
    if (!current) return
    setAnchor(view === "week" ? addWeeks(current, direction) : addMonths(current, direction))
  }

  const label = range
    ? view === "week"
      ? `${format(range.start, "MMM d")} – ${format(range.end, isSameMonth(range.start, range.end) ? "d, yyyy" : "MMM d, yyyy")}`
      : format(current!, "MMMM yyyy")
    : ""

  const postsOn = (day: Date) =>
    (posts ?? []).filter((p) => {
      const date = postDate(p)
      return date && isSameDay(new Date(date), day)
    })

  const canDropOn = (day: Date) => !!now && !isBefore(day, startOfDay(now))

  const onDrop = (event: DragEvent, day: Date) => {
    event.preventDefault()
    setDropTarget(null)
    const id = event.dataTransfer.getData(DRAG_TYPE)
    const post = [...(posts ?? []), ...unscheduled].find((p) => p.id === id)
    if (!post || !canDropOn(day)) return
    const previous = post.scheduledAt ? new Date(post.scheduledAt) : setHours(day, 9)
    const next = setMinutes(setHours(day, previous.getHours()), previous.getMinutes())
    if (post.scheduledAt && next.getTime() === previous.getTime()) return
    reschedule.mutate(
      { id, scheduledAt: next.toISOString() },
      { onSuccess: () => toast.success(`Moved to ${format(next, "EEE, MMM d · HH:mm")}`) }
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
        description={label || " "}
        actions={
          <>
            <div className="inline-flex items-center rounded-xl border border-border bg-card">
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
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
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
          {error ? (
            <div className="rounded-3xl border border-border bg-card">
              <ErrorState error={error} onRetry={() => refetch()} />
            </div>
          ) : !range || !posts || !now ? (
            <Skeleton className="h-[32rem] rounded-3xl" />
          ) : view === "week" ? (
            <WeekView
              days={eachDayOfInterval(range)}
              now={now}
              postsOn={postsOn}
              dropProps={dropProps}
              canDropOn={canDropOn}
              onSelect={setSelectedId}
            />
          ) : (
            <MonthView
              days={eachDayOfInterval(range)}
              month={current!}
              now={now}
              postsOn={postsOn}
              dropProps={dropProps}
              onSelect={setSelectedId}
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
                  <PostChip post={p} onSelect={setSelectedId} />
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
  now: Date
  postsOn: (day: Date) => Post[]
  dropProps: (day: Date) => Record<string, unknown>
  onSelect: (id: string) => void
}

function WeekView({ days, now, postsOn, dropProps, canDropOn, onSelect }: DayProps & { days: Date[]; canDropOn: (day: Date) => boolean }) {
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
                    <PostChip post={p} onSelect={onSelect} />
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
                      <PostChip post={p} onSelect={onSelect} />
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
                    <PostChip post={p} onSelect={onSelect} compact />
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

function PostChip({ post, onSelect, compact = false }: { post: Post; onSelect: (id: string) => void; compact?: boolean }) {
  const date = postDate(post)
  const draggable = post.status !== "published"
  const color = networks[post.networks[0] ?? "x"].color

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
        compact ? "px-1.5 py-1" : "p-2.5"
      )}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {compact ? (
        <span className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{date ? formatTime(date) : ""}</span>
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
            <span className="text-[11px] font-medium text-muted-foreground">
              {date ? formatTime(date) : "No date"}
            </span>
          </span>
          <span className="mt-1.5 line-clamp-2 block text-xs font-semibold">{postTitle(post)}</span>
          <span className="mt-1 block text-[10px] font-semibold text-muted-foreground uppercase">{post.status}</span>
        </>
      )}
    </button>
  )
}
