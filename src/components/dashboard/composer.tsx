"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef, useState, type ChangeEvent } from "react"
import { addDays, format, setHours, setMinutes, startOfMinute } from "date-fns"
import { CalendarClock, Hash, ImagePlus, Link2, RotateCcw, Send, Smile, X } from "lucide-react"
import { toast } from "sonner"
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Panel } from "@/components/dashboard/ui"
import { FormField, selectClassName } from "@/components/form-field"
import { NetworkTile } from "@/components/network"
import { Button, ButtonLink } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimePicker } from "@/components/ui/time-picker"
import { networks, type NetworkId } from "@/config/networks"
import { routes } from "@/config/site"
import { useNow } from "@/hooks/use-now"
import type { Post, PostInput, PostInputStatus, PostMedia, SocialAccount } from "@/lib/api/types"
import { initials } from "@/lib/format"
import { captionFor, EDITABLE_STATUSES, validatePost } from "@/lib/posts"
import { zonedParts, zonedTimeToIso } from "@/lib/tz"
import { useBrandTimeZone } from "@/hooks/use-brand-timezone"
import { useLinkedAccounts } from "@/lib/queries/accounts"
import { useBilling } from "@/lib/queries/billing"
import { useCreatePost, usePinterestBoards, usePost, useUpdatePost } from "@/lib/queries/posts"
import { errorMessage } from "@/lib/api/errors"
import { mediaApi } from "@/lib/api/media"
import { activeBrand } from "@/lib/api/workspace"
import { useWorkspace } from "@/lib/queries/workspace"
import { cn } from "@/lib/utils"

const MAX_MEDIA = 10
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024
const MAX_VIDEO_BYTES = 64 * 1024 * 1024
const EMOJI = ["✨", "🔥", "🎉", "🙌", "💛", "😍", "🍂", "☕️", "📸", "🎥", "🛍️", "📣", "✅", "👉", "💬", "🚀"]
const HASHTAGS = ["#newin", "#autumnedit", "#behindthescenes", "#smallbusiness", "#shoplocal", "#studio"]
const SUGGESTED_HOURS = [9, 13, 18]

/** Loads the post being edited (if any) and mounts a fresh form for it. */
export function Composer() {
  const params = useSearchParams()
  const postId = params.get("post")
  const date = params.get("date")
  const post = usePost(postId)
  const accounts = useLinkedAccounts()

  if (accounts.error) return <ErrorState error={accounts.error} onRetry={() => accounts.refetch()} />
  if (post.error) return <ErrorState error={post.error} onRetry={() => post.refetch()} />
  if (!accounts.data || (postId && !post.data)) return <ListSkeleton rows={6} />

  if (post.data && !EDITABLE_STATUSES.includes(post.data.status)) {
    return (
      <Panel>
        <EmptyState
          icon={<Send />}
          title={post.data.status === "publishing" ? "This post is being published" : "This post has already gone out"}
          description={
            post.data.status === "publishing"
              ? "Wait for delivery to finish, then check the planner."
              : "Posts that have been published can't be edited. Duplicate it from the planner to post a new version."
          }
          action={
            <ButtonLink variant="ink" href={routes.dashboard.planner}>
              Back to planner
            </ButtonLink>
          }
        />
      </Panel>
    )
  }

  if (accounts.data.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={<Link2 />}
          title="Connect a network first"
          description="Link at least one account to start posting."
          action={
            <ButtonLink variant="ink" href={routes.dashboard.accounts}>
              Connect accounts
            </ButtonLink>
          }
        />
      </Panel>
    )
  }

  return <ComposerForm key={postId ?? `new-${date}`} post={post.data ?? null} date={date} accounts={accounts.data} />
}

function toLocalParts(iso: string | null, timeZone: string) {
  if (!iso) return { date: "", time: "" }
  return zonedParts(iso, timeZone)
}

function ComposerForm({ post, date, accounts }: { post: Post | null; date: string | null; accounts: SocialAccount[] }) {
  const router = useRouter()
  const now = useNow()
  const { data: workspace } = useWorkspace()
  const { data: billing } = useBilling()
  const brand = workspace ? activeBrand(workspace) : null
  const create = useCreatePost()
  const update = useUpdatePost()
  const showBestTimes = billing ? billing.subscription.planId !== "free" : false
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const available = accounts.map((a) => a.network)
  const timeZone = useBrandTimeZone()
  const initial = toLocalParts(post?.status === "scheduled" ? post.scheduledAt : null, timeZone)
  const [selected, setSelected] = useState<NetworkId[]>(
    post?.networks.filter((n) => available.includes(n)) ?? available.slice(0, 1)
  )
  const [body, setBody] = useState(post?.body ?? "")
  const [overrides, setOverrides] = useState<Post["overrides"]>(post?.overrides ?? {})
  const [options, setOptions] = useState<Post["options"]>(post?.options ?? {})
  const [media, setMedia] = useState<PostMedia[]>(post?.media ?? [])
  const [day, setDay] = useState(initial.date || date || "")
  const [time, setTime] = useState(initial.time || (date ? "09:00" : ""))
  const [tab, setTab] = useState<"all" | NetworkId>("all")
  const [errors, setErrors] = useState<string[]>([])

  const activeTab = tab !== "all" && !selected.includes(tab) ? "all" : tab
  const previewNetwork = activeTab !== "all" ? activeTab : selected[0]
  const value = activeTab === "all" ? body : (overrides[activeTab] ?? body)
  const saving = create.isPending || update.isPending
  const boards = usePinterestBoards(selected.includes("pinterest"))
  const pinterest = (options.pinterest ?? {}) as { boardId?: string; link?: string; title?: string }
  const setPinterest = (patch: Partial<typeof pinterest>) => setOptions((prev) => ({ ...prev, pinterest: { ...pinterest, ...patch } }))

  const toggleNetwork = (id: NetworkId) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]))

  const setValue = (text: string) => {
    if (activeTab === "all") setBody(text)
    else setOverrides((prev) => ({ ...prev, [activeTab]: text }))
  }

  const insert = (snippet: string) => {
    const el = textareaRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const spaced = (start > 0 && !/\s$/.test(value.slice(0, start)) ? " " : "") + snippet
    setValue(value.slice(0, start) + spaced + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + spaced.length, start + spaced.length)
    })
  }

  const addFiles = async (files: File[]) => {
    const room = MAX_MEDIA - media.length
    if (files.length > room) toast.error(`You can attach up to ${MAX_MEDIA} files.`)
    const accepted = files.slice(0, Math.max(room, 0)).filter((f) => {
      const video = f.type.startsWith("video/")
      if (f.size <= (video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) return true
      toast.error(`${f.name} is larger than ${video ? "64 MB" : "1.5 MB"}.`)
      return false
    })
    if (!accepted.length) return
    try {
      const items = await Promise.all(accepted.map((file) => mediaApi.upload(file)))
      setMedia((prev) => [...prev, ...items])
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const buildInput = (status: PostInputStatus): PostInput => {
    const cleanOverrides = Object.fromEntries(
      Object.entries(overrides).filter(([n, text]) => selected.includes(n as NetworkId) && text !== body)
    )
    // The date and time are wall-clock in the brand's timezone, not the browser's.
    const scheduledAt = day && time ? zonedTimeToIso(day, time, timeZone) : null
    const cleanOptions = Object.fromEntries(Object.entries(options).filter(([n]) => selected.includes(n as NetworkId)))
    return { networks: selected, body, overrides: cleanOverrides, options: cleanOptions, media, status, scheduledAt }
  }

  const submit = (status: PostInputStatus) => {
    const input = buildInput(status)
    const problems = validatePost(input)
    setErrors(problems)
    if (problems.length) return

    const messages = { draft: "Draft saved", scheduled: "Post scheduled", published: "Post published" }
    const onSuccess = (saved: Post) => {
      // The service reports what actually happened; never claim success it didn't confirm.
      if (saved.status === "failed" || saved.status === "partial") {
        const reasons = saved.deliveries.filter((d) => d.status === "failed").map((d) => `${networks[d.network].name}: ${d.error ?? "failed"}`)
        toast.error(saved.status === "failed" ? "Publishing failed" : "Published to some networks only", { description: reasons.join(" · ") })
        router.push(`${routes.dashboard.compose}?post=${saved.id}`)
        return
      }
      if (saved.status === "publishing") {
        toast.info("Publishing… a network is retrying automatically. Check the planner for the result.")
      } else {
        toast.success(messages[status])
      }
      router.push(routes.dashboard.planner)
    }
    const onError = (error: unknown) => setErrors([errorMessage(error)])
    if (post) update.mutate({ id: post.id, patch: input }, { onSuccess, onError })
    else create.mutate(input, { onSuccess, onError })
  }

  const suggestions =
    showBestTimes && now
      ? SUGGESTED_HOURS.flatMap((h) => {
          const today = startOfMinute(setMinutes(setHours(now, h), 0))
          return [today > now ? today : addDays(today, 1)]
        }).sort((a, b) => a.getTime() - b.getTime())
      : []

  return (
    <>
      <PageHeader
        title={post ? "Edit post" : "Compose"}
        description={post ? "Update the caption, networks, or timing." : "Write once, tailor for each network, and schedule."}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel title="Post to">
          <ul className="flex flex-wrap gap-2">
            {accounts.map((a) => {
              const on = selected.includes(a.network)
              return (
                <li key={a.network}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleNetwork(a.network)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-2xl border py-1.5 pr-3 pl-1.5 text-sm font-medium transition-colors",
                      on ? "border-foreground bg-foreground/5" : "border-border opacity-60 hover:opacity-100"
                    )}
                  >
                    <NetworkTile network={a.network} size="sm" />
                    {a.handle}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-6">
            <div role="tablist" aria-label="Caption" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {(["all", ...selected] as const).map((id) => {
                const isActive = activeTab === id
                const customized = id !== "all" && overrides[id] !== undefined && overrides[id] !== body
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(id)}
                    className="relative shrink-0 cursor-pointer rounded-t-xl border border-b-0 border-transparent px-3 py-2 text-xs font-medium text-muted-foreground aria-selected:border-input aria-selected:bg-card aria-selected:text-foreground"
                  >
                    {id === "all" ? "Original" : networks[id].name}
                    {customized ? <span className="ml-1.5 inline-block size-1.5 rounded-full bg-brand align-middle" /> : null}
                  </button>
                )
              })}
            </div>
            <div className="-mt-px rounded-2xl rounded-tl-none border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <label htmlFor="caption" className="sr-only">
                Caption
              </label>
              <textarea
                ref={textareaRef}
                id="caption"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={8}
                placeholder={activeTab === "all" ? "What do you want to share?" : `Customize for ${networks[activeTab].name}…`}
                className="block w-full resize-none bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
              <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-1.5">
                <Button variant="ghost" size="icon-sm" aria-label="Add images" onClick={() => fileRef.current?.click()}>
                  <ImagePlus />
                </Button>
                <InsertPopover label="Emoji" icon={<Smile />} items={EMOJI} onPick={insert} grid />
                <InsertPopover label="Hashtags" icon={<Hash />} items={HASHTAGS} onPick={insert} />
                {activeTab !== "all" && overrides[activeTab] !== undefined ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      setOverrides((prev) => {
                        const next = { ...prev }
                        delete next[activeTab]
                        return next
                      })
                    }
                  >
                    <RotateCcw data-icon="inline-start" />
                    Use original
                  </Button>
                ) : null}
                <CharCounts body={body} overrides={overrides} selected={selected} />
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              multiple
              hidden
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                void addFiles(Array.from(e.target.files ?? []))
                e.target.value = ""
              }}
            />
          </div>

          {media.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {media.map((m) => (
                <li key={m.id} className="relative">
                  {m.mimeType?.startsWith("video/") ? (
                    <video src={m.url} className="size-20 rounded-xl object-cover" muted aria-label={m.name} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- uploaded media served by the API
                    <img src={m.url} alt={m.name} className="size-20 rounded-xl object-cover" />
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${m.name}`}
                    onClick={() => setMedia((prev) => prev.filter((x) => x.id !== m.id))}
                    className="absolute -top-1.5 -right-1.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground text-background"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                void addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/")))
              }}
              className="mt-4 flex h-24 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-foreground/25 text-sm text-muted-foreground transition-colors hover:border-foreground/50"
            >
              <ImagePlus className="mr-2 size-4" />
              Drop images or videos here, or click to upload
            </button>
          )}
          <NetworkHints selected={selected} media={media} />

          {selected.includes("pinterest") ? (
            <div className="mt-4 grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
              <FormField id="pin-board" label="Pinterest board" hint={boards.error ? errorMessage(boards.error) : undefined}>
                <select
                  id="pin-board"
                  className={selectClassName}
                  value={pinterest.boardId ?? ""}
                  disabled={boards.isLoading || !!boards.error}
                  onChange={(e) => setPinterest({ boardId: e.target.value })}
                >
                  <option value="">{boards.isLoading ? "Loading boards…" : "Choose a board"}</option>
                  {boards.data?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="pin-link" label="Destination link (optional)">
                <input
                  id="pin-link"
                  type="url"
                  value={pinterest.link ?? ""}
                  onChange={(e) => setPinterest({ link: e.target.value })}
                  placeholder="https://"
                  className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </FormField>
            </div>
          ) : null}

          {post && post.deliveries.some((d) => d.status === "failed") ? (
            <ul role="alert" className="mt-4 space-y-1 rounded-2xl bg-destructive/8 p-3 text-sm text-destructive">
              <li className="font-semibold">These networks didn&apos;t publish:</li>
              {post.deliveries
                .filter((d) => d.status === "failed")
                .map((d) => (
                  <li key={d.network}>
                    • {networks[d.network].name}: {d.error ?? "failed"}
                  </li>
                ))}
            </ul>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FormField id="date" label="Date" hint={`Times are in ${timeZone}.`}>
              <DatePicker
                id="date"
                value={day}
                onChange={setDay}
                min={now ?? undefined}
                placeholder="Pick a date"
              />
            </FormField>
            <FormField id="time" label="Time">
              <TimePicker id="time" value={time} onChange={setTime} placeholder="Pick a time" />
            </FormField>
          </div>
          {suggestions.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Best times:</span>
              {suggestions.map((s) => (
                <button
                  key={s.toISOString()}
                  type="button"
                  onClick={() => {
                    setDay(format(s, "yyyy-MM-dd"))
                    setTime(format(s, "HH:mm"))
                  }}
                  className="cursor-pointer rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:border-foreground/40"
                >
                  {format(s, "EEE HH:mm")}
                </button>
              ))}
            </div>
          ) : null}

          {errors.length ? (
            <ul role="alert" className="mt-5 space-y-1 rounded-2xl bg-destructive/8 p-3 text-sm text-destructive">
              {errors.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
            <ButtonLink variant="ghost" href={routes.dashboard.planner} className="sm:mr-auto">
              Cancel
            </ButtonLink>
            <Button variant="outline" disabled={saving} onClick={() => submit("draft")}>
              Save draft
            </Button>
            <Button variant="outline" disabled={saving} onClick={() => submit("published")}>
              <Send data-icon="inline-start" />
              {saving ? "Working…" : post?.status === "failed" ? "Publish again" : "Publish now"}
            </Button>
            <Button variant="ink" disabled={saving} onClick={() => submit("scheduled")}>
              <CalendarClock data-icon="inline-start" />
              {post?.status === "scheduled" ? "Update schedule" : "Schedule"}
            </Button>
          </div>
        </Panel>

        <Panel
          title="Preview"
          className="xl:sticky xl:top-24 xl:self-start"
          action={
            selected.length > 1 ? (
              <div className="flex gap-1">
                {selected.map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`Preview on ${networks[id].name}`}
                    aria-pressed={id === previewNetwork}
                    onClick={() => setTab(id)}
                    className="cursor-pointer rounded-lg opacity-40 transition-opacity aria-pressed:opacity-100"
                  >
                    <NetworkTile network={id} size="sm" />
                  </button>
                ))}
              </div>
            ) : null
          }
        >
          {previewNetwork ? (
            <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border">
              <div className="flex items-center gap-2.5 p-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-ink-foreground">
                  {brand ? initials(brand.name) : ""}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {accounts.find((a) => a.network === previewNetwork)?.handle ?? brand?.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {networks[previewNetwork].name}
                    {day && time ? ` · ${format(new Date(`${day}T${time}:00`), "MMM d, HH:mm")}` : ""}
                  </p>
                </div>
              </div>
              {media[0] ? (
                media[0].mimeType?.startsWith("video/") ? (
                  <video src={media[0].url} className="aspect-[4/3] w-full object-cover" muted controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded media served by the API
                  <img src={media[0].url} alt="" className="aspect-[4/3] w-full object-cover" />
                )
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-500 via-amber-400 to-lime-400" />
              )}
              <p className="p-3 text-sm break-words whitespace-pre-line">
                {captionFor({ body, overrides }, previewNetwork) || (
                  <span className="text-muted-foreground">Your caption will appear here.</span>
                )}
              </p>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">Select a network to see a preview.</p>
          )}
        </Panel>
      </div>
    </>
  )
}

function CharCounts({
  body,
  overrides,
  selected,
}: {
  body: string
  overrides: Post["overrides"]
  selected: NetworkId[]
}) {
  return (
    <span className="ml-auto flex flex-wrap justify-end gap-2 pr-1 text-[11px] text-muted-foreground">
      {selected.map((n) => {
        const left = networks[n].charLimit - captionFor({ body, overrides }, n).length
        return (
          <span key={n} className={cn(left < 0 && "font-semibold text-destructive")} title={networks[n].name}>
            {networks[n].name.slice(0, 2)} {left.toLocaleString()}
          </span>
        )
      })}
    </span>
  )
}

function InsertPopover({
  label,
  icon,
  items,
  onPick,
  grid = false,
}: {
  label: string
  icon: React.ReactNode
  items: string[]
  onPick: (value: string) => void
  grid?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} />}>{icon}</PopoverTrigger>
      <PopoverContent align="start" className={cn("rounded-2xl p-2", grid ? "w-60" : "w-56")}>
        <div className={cn(grid ? "grid grid-cols-8 gap-0.5" : "flex flex-col")}>
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onPick(item)
                setOpen(false)
              }}
              className={cn(
                "cursor-pointer rounded-lg hover:bg-muted",
                grid ? "aspect-square text-lg" : "px-2.5 py-1.5 text-left text-sm"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const networkNotes: Partial<Record<NetworkId, (media: PostMedia[]) => string | null>> = {
  instagram: (m) => (m.length === 0 ? "Instagram needs at least one image or a video." : null),
  tiktok: (m) => (m.filter((x) => x.mimeType?.startsWith("video/")).length !== 1 ? "TikTok needs exactly one video." : null),
  pinterest: (m) => (m.length !== 1 ? "Pinterest pins need exactly one image." : null),
  x: (m) => (m.length ? "X posting is text-only for now; remove the media or deselect X." : null),
  threads: (m) => (m.length ? "Threads posting is text-only for now; remove the media or deselect Threads." : null),
}

/** Platform media rules, shown before the user hits Publish. The service enforces them too. */
function NetworkHints({ selected, media }: { selected: NetworkId[]; media: PostMedia[] }) {
  const hints = selected.map((n) => networkNotes[n]?.(media)).filter((h): h is string => !!h)
  if (hints.length === 0) return null
  return (
    <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
      {hints.map((h) => (
        <li key={h}>{h}</li>
      ))}
    </ul>
  )
}
