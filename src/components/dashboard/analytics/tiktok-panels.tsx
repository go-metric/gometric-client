"use client"

import { format, parseISO } from "date-fns"
import { BadgeCheck, ExternalLink, Film, Heart, MessageCircle, PlayCircle } from "lucide-react"
import { EmptyState, ErrorState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { useTikTokProfile, useTikTokVideos } from "@/lib/queries/accounts"
import { formatCompact } from "@/lib/format"

const stat = (value: number | null) => (value === null ? "n/a" : formatCompact(value))

/** Profile from TikTok's Login Kit and Display API: name, avatar, bio, verified badge and the account's counts. */
export function TikTokProfileCard() {
  const { data, error, isLoading, refetch } = useTikTokProfile()

  if (error) {
    return (
      <Panel title="TikTok profile">
        <ErrorState error={error} onRetry={() => refetch()} />
      </Panel>
    )
  }

  if (isLoading || !data) {
    return (
      <Panel title="TikTok profile">
        <ListSkeleton rows={2} />
      </Panel>
    )
  }

  const tiles: { label: string; value: number | null }[] = [
    { label: "Followers", value: data.followers },
    { label: "Following", value: data.following },
    { label: "Likes", value: data.likes },
    { label: "Videos", value: data.videoCount },
  ]
  const name = data.displayName ?? data.username ?? "TikTok account"

  return (
    <Panel title="TikTok profile">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed TikTok CDN URL, not optimisable
            <img src={data.avatarUrl} alt={`${name} profile picture`} className="size-16 shrink-0 rounded-full border border-border object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span aria-hidden className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-base font-semibold">
              <span className="truncate">{name}</span>
              {data.verified ? <BadgeCheck aria-label="Verified account" className="size-4 shrink-0 text-sky-500" /> : null}
            </p>
            {data.username ? (
              data.profileUrl ? (
                <a href={data.profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  @{data.username} <ExternalLink className="size-3" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">@{data.username}</p>
              )
            ) : null}
            <p className="mt-1.5 text-sm text-muted-foreground">{data.bio ?? "No bio yet."}</p>
          </div>
        </div>
        <dl className="grid shrink-0 grid-cols-4 gap-2 sm:gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-2xl bg-muted/60 px-3 py-2.5 text-center">
              <dd className="text-lg font-semibold tabular-nums">{stat(t.value)}</dd>
              <dt className="text-xs text-muted-foreground">{t.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  )
}

/** The account's videos with views, likes and comments (Display API video.list). */
export function TikTokVideosPanel() {
  const { data, error, isLoading, refetch } = useTikTokVideos()

  return (
    <Panel title="Your TikTok videos" bodyClassName="px-0 pb-2 sm:px-0">
      {error ? (
        <div className="px-5 sm:px-6">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      ) : isLoading || !data ? (
        <ListSkeleton rows={3} className="px-5 sm:px-6" />
      ) : data.videos.length === 0 ? (
        <EmptyState icon={<Film />} title="No videos on this TikTok account yet" description="Videos you post on TikTok appear here with their views, likes and comments." />
      ) : (
        <ul className="divide-y divide-border/60">
          {data.videos.map((v) => (
            <li key={v.id} className="flex items-center gap-4 px-5 py-3 sm:px-6">
              {v.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed TikTok CDN URL, not optimisable
                <img src={v.coverUrl} alt="" className="h-20 w-14 shrink-0 rounded-xl border border-border object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span aria-hidden className="inline-flex h-20 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Film className="size-5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.title || "Untitled video"}</p>
                <p className="text-xs text-muted-foreground">{v.createdAt ? format(parseISO(v.createdAt), "MMM d, yyyy") : "Date unavailable"}</p>
                <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><PlayCircle className="size-3.5" /> {stat(v.views)} views</span>
                  <span className="inline-flex items-center gap-1"><Heart className="size-3.5" /> {stat(v.likes)}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" /> {stat(v.comments)}</span>
                </p>
              </div>
              {v.shareUrl ? (
                <a href={v.shareUrl} target="_blank" rel="noreferrer" aria-label="Open on TikTok" className="shrink-0 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="size-4" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

