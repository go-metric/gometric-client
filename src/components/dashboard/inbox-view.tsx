"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Inbox,
  Info,
  MailOpen,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  StickyNote,
} from "lucide-react"
import { toast } from "sonner"
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Segmented } from "@/components/dashboard/ui"
import { selectClassName } from "@/components/form-field"
import { NetworkBadge, PersonAvatar } from "@/components/network"
import { Button, ButtonLink } from "@/components/ui/button"
import { networks, type NetworkId } from "@/config/networks"
import { routes } from "@/config/site"
import { errorMessage } from "@/lib/api/errors"
import type {
  CapabilityState,
  Conversation,
  ConversationKind,
  ConversationStatus,
  ConversationSummary,
  InboxAccountState,
} from "@/lib/api/types"
import { formatAgo, formatWhen } from "@/lib/format"
import {
  useAddNote,
  useConversation,
  useConversationList,
  useInboxMembers,
  useReply,
  useSetAssignee,
  useSetConversationStatus,
  useSetUnread,
  useSyncInbox,
} from "@/lib/queries/inbox"
import { useWorkspace } from "@/lib/queries/workspace"
import { cn } from "@/lib/utils"

type KindFilter = "all" | "unread" | ConversationKind

const kindFilters: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "comment", label: "Comments" },
  { value: "dm", label: "DMs" },
]

const statusLabels: Record<ConversationStatus, string> = { open: "Open", pending: "Pending", done: "Resolved" }

function selectConversation(id: string | null) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set("c", id)
  else url.searchParams.delete("c")
  window.history.replaceState(null, "", url)
}

function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

/** Plain-language reason a surface can't be read, or null when it works. */
function surfaceProblem(state: CapabilityState, label: string): string | null {
  if (state.state === "available") return null
  if (state.state === "unsupported") return `${label}: ${state.reason}`
  if (state.state === "needs_reauthorization") return `${label}: reconnect to grant ${state.missingScopes.join(", ")}.`
  return null
}

export function InboxView() {
  const params = useSearchParams()
  const activeId = params.get("c")
  const [status, setStatus] = useState<ConversationStatus>("open")
  const [kind, setKind] = useState<KindFilter>("all")
  const [network, setNetwork] = useState<NetworkId | "all">("all")
  const [accountId, setAccountId] = useState("all")
  const [mine, setMine] = useState(false)
  const [query, setQuery] = useState("")
  const q = useDebounced(query.trim())
  const { data: members } = useInboxMembers()
  const { data: workspace } = useWorkspace()
  const sync = useSyncInbox()

  const filters = {
    status,
    ...(kind === "unread" ? { unread: true } : kind === "all" ? {} : { kind }),
    ...(network !== "all" ? { network } : {}),
    ...(accountId !== "all" ? { accountId } : {}),
    ...(q ? { q } : {}),
    limit: 30,
  }
  const list = useConversationList(filters)
  const items = useMemo(() => list.data?.pages.flatMap((p) => p.items) ?? [], [list.data])
  const meta = list.data?.pages[0]
  const accounts = useMemo(() => meta?.accounts ?? [], [meta])
  const me = members?.[0]?.id
  const visible = mine && me ? items.filter((c) => c.assigneeId === me) : items

  const lastSynced = accounts.map((a) => a.syncedAt).filter((v): v is string => !!v).sort().at(-1)
  const scopedAccounts = network === "all" ? accounts : accounts.filter((a) => a.network === network)
  const brandName = workspace?.brands.find((b) => b.id === workspace.activeBrandId)?.name

  return (
    <>
      <PageHeader
        title="Inbox"
        description={
          meta
            ? `${meta.unreadTotal} unread · ${lastSynced ? `last synced ${formatAgo(lastSynced)}` : "waiting for the first sync"}`
            : " "
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Conversation status"
              value={status}
              onChange={setStatus}
              options={(Object.keys(statusLabels) as ConversationStatus[]).map((s) => ({ value: s, label: statusLabels[s] }))}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={sync.isPending || accounts.length === 0}
              onClick={() =>
                sync.mutate(undefined, {
                  onSuccess: ({ results }) => {
                    const failed = results.find((r) => r.status === "failed")
                    const added = results.reduce((n, r) => n + r.newMessages, 0)
                    if (failed) toast.error(failed.message ?? "Sync failed.")
                    else toast.success(added ? `${added} new message${added === 1 ? "" : "s"}` : "Inbox is up to date")
                  },
                  onError: (e) => toast.error(errorMessage(e)),
                })
              }
            >
              <RefreshCw data-icon="inline-start" className={cn(sync.isPending && "animate-spin")} />
              {sync.isPending ? "Syncing…" : "Sync now"}
            </Button>
          </div>
        }
      />

      <Coverage accounts={scopedAccounts} />

      <div className="grid h-[calc(100svh-15rem)] min-h-[32rem] overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className={cn("flex min-h-0 flex-col border-border md:border-r", activeId && "hidden md:flex")}>
          <div className="space-y-2 border-b border-border p-3">
            <label className="relative block">
              <span className="sr-only">Search conversations</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people, messages, posts"
                className="h-9 w-full rounded-xl border border-input bg-muted/50 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label="Network"
                className={cn(selectClassName, "h-9 rounded-xl text-sm")}
                value={network}
                onChange={(e) => {
                  setNetwork(e.target.value as NetworkId | "all")
                  setAccountId("all")
                }}
              >
                <option value="all">All networks</option>
                {[...new Set(accounts.map((a) => a.network))].map((n) => (
                  <option key={n} value={n}>
                    {networks[n].name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Account"
                className={cn(selectClassName, "h-9 rounded-xl text-sm")}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="all">All accounts</option>
                {scopedAccounts.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {networks[a.network].name} {a.handle}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {kindFilters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={kind === f.value}
                  onClick={() => setKind(f.value)}
                  className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-foreground/65 transition-colors hover:bg-muted aria-pressed:bg-ink aria-pressed:text-ink-foreground"
                >
                  {f.label}
                </button>
              ))}
              {me ? (
                <button
                  type="button"
                  aria-pressed={mine}
                  onClick={() => setMine((v) => !v)}
                  className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-foreground/65 transition-colors hover:bg-muted aria-pressed:bg-ink aria-pressed:text-ink-foreground"
                >
                  Assigned to me
                </button>
              ) : null}
            </div>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            {list.error ? (
              <li>
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
              </li>
            ) : !meta ? (
              <li className="p-2">
                <ListSkeleton rows={6} />
              </li>
            ) : visible.length === 0 ? (
              <li>
                <ListEmpty
                  accounts={accounts}
                  filtered={!!q || kind !== "all" || network !== "all" || accountId !== "all" || mine}
                  status={status}
                  brandName={brandName}
                />
              </li>
            ) : (
              <>
                {visible.map((c) => (
                  <ConversationRow key={c.id} conversation={c} active={c.id === activeId} />
                ))}
                {list.hasNextPage ? (
                  <li className="p-2">
                    <Button variant="outline" size="sm" className="w-full" disabled={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
                      {list.isFetchingNextPage ? "Loading…" : "Load more"}
                    </Button>
                  </li>
                ) : null}
              </>
            )}
          </ul>
        </div>

        <div className={cn("min-h-0 flex-col", activeId ? "flex" : "hidden md:flex")}>
          {activeId ? (
            <Thread key={activeId} id={activeId} onBack={() => selectConversation(null)} />
          ) : (
            <EmptyState icon={<MessageSquareText />} title="Select a conversation" className="flex-1" />
          )}
        </div>
      </div>
    </>
  )
}

/** What the inbox can and can't read for each connected account, plus sync problems. */
function Coverage({ accounts }: { accounts: InboxAccountState[] }) {
  const notes = accounts.flatMap((a) => {
    const name = `${networks[a.network].name} ${a.handle ?? ""}`.trim()
    const out: { key: string; tone: "warn" | "info"; text: string; reconnect?: boolean }[] = []
    if (a.status === "expired") out.push({ key: `${a.accountId}-exp`, tone: "warn", text: `${name}: connection expired.`, reconnect: true })
    if (a.syncError) out.push({ key: `${a.accountId}-err`, tone: "warn", text: `${name}: ${a.syncError}` })
    const c = surfaceProblem(a.comments, "Comments")
    const d = surfaceProblem(a.dms, "Messages")
    if (c) out.push({ key: `${a.accountId}-c`, tone: c.includes("reconnect") ? "warn" : "info", text: `${name} — ${c}`, reconnect: c.includes("reconnect") })
    if (d) out.push({ key: `${a.accountId}-d`, tone: d.includes("reconnect") ? "warn" : "info", text: `${name} — ${d}`, reconnect: d.includes("reconnect") })
    return out
  })
  if (notes.length === 0) return null
  const warnings = notes.filter((n) => n.tone === "warn")
  const limits = notes.filter((n) => n.tone === "info")
  return (
    <div className="mb-4 space-y-2">
      {warnings.length > 0 ? (
        <ul className="space-y-2" aria-label="Inbox problems">
          {warnings.map((n) => (
            <li key={n.key} className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span className="min-w-0 flex-1">{n.text}</span>
              {n.reconnect ? (
                <Link href={routes.dashboard.accounts} className="shrink-0 font-semibold underline underline-offset-2">
                  Reconnect
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {limits.length > 0 ? (
        <details className="rounded-2xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <Info className="size-4 shrink-0" />
            What the inbox can&apos;t read ({limits.length})
          </summary>
          <ul className="mt-2 space-y-1 pl-6">
            {limits.map((n) => (
              <li key={n.key}>{n.text}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}

function ListEmpty({
  accounts,
  filtered,
  status,
  brandName,
}: {
  accounts: InboxAccountState[]
  filtered: boolean
  status: ConversationStatus
  brandName?: string
}) {
  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={<Inbox />}
        title="Connect an account to start"
        description={`Comments and messages from ${brandName ?? "your brand"}'s connected accounts show up here.`}
        action={
          <ButtonLink href={routes.dashboard.accounts} variant="ink" size="sm">
            Connect accounts
          </ButtonLink>
        }
      />
    )
  }
  if (filtered) return <EmptyState icon={<Inbox />} title="No matching conversations" description="Try clearing the filters or search." />
  const unsynced = accounts.every((a) => !a.syncedAt)
  return (
    <EmptyState
      icon={<Inbox />}
      title={unsynced ? "Waiting for the first sync" : status === "open" ? "You're all caught up" : `Nothing ${statusLabels[status].toLowerCase()}`}
      description={unsynced ? "Use Sync now to pull in recent comments and messages." : undefined}
    />
  )
}

function ConversationRow({ conversation: c, active }: { conversation: ConversationSummary; active: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => selectConversation(c.id)}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-muted/70",
          active && "bg-muted"
        )}
      >
        <PersonAvatar initials={c.contact.initials} color={c.contact.color} network={c.network} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{c.contact.name}</p>
            <span className="shrink-0 text-[11px] text-muted-foreground">{formatAgo(c.updatedAt)}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {c.kind === "dm" ? "Direct message" : `Comment on “${c.postTitle ?? "post"}”`}
          </p>
          <p className={cn("mt-0.5 line-clamp-1 text-sm", !c.unread && "text-muted-foreground")}>
            {c.lastMessage?.from === "brand" ? "You: " : ""}
            {c.lastMessage?.text}
          </p>
        </div>
        {c.unread ? <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-brand" /> : null}
      </button>
    </li>
  )
}

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const { data: c, error, refetch } = useConversation(id)
  const markRead = useSetUnread()
  const markReadMutate = markRead.mutate
  const wasUnread = c?.unread

  useEffect(() => {
    if (wasUnread) markReadMutate({ id, unread: false })
  }, [id, wasUnread, markReadMutate])

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!c) {
    return (
      <div className="p-4">
        <ListSkeleton rows={4} />
      </div>
    )
  }
  return <ThreadBody conversation={c} onBack={onBack} />
}

function ThreadBody({ conversation: c, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { data: members } = useInboxMembers()
  const reply = useReply()
  const setStatus = useSetConversationStatus()
  const setUnread = useSetUnread()
  const setAssignee = useSetAssignee()
  const addNote = useAddNote()
  const [text, setText] = useState("")
  const [note, setNote] = useState("")
  const [showNotes, setShowNotes] = useState(c.notes.length > 0)
  const endRef = useRef<HTMLDivElement>(null)
  const canReply = c.reply.allowed

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [c.messages.length])

  const send = () => {
    if (!text.trim() || !canReply || reply.isPending) return
    reply.mutate(
      { id: c.id, text },
      {
        onSuccess: () => setText(""),
        onError: (e) => toast.error(errorMessage(e)),
      }
    )
  }

  return (
    <>
      <header className="flex flex-wrap items-center gap-2 border-b border-border p-3 sm:gap-3 sm:p-4">
        <Button variant="ghost" size="icon-sm" aria-label="Back to conversations" className="md:hidden" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <PersonAvatar initials={c.contact.initials} color={c.contact.color} network={c.network} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{c.contact.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {networks[c.network].name} · {c.kind === "dm" ? "Direct message" : "Comment"}
          </p>
        </div>
        <label className="sr-only" htmlFor="thread-status">
          Status
        </label>
        <select
          id="thread-status"
          className={cn(selectClassName, "h-8 w-auto rounded-lg py-0 text-xs")}
          value={c.status}
          onChange={(e) => setStatus.mutate({ id: c.id, status: e.target.value as ConversationStatus }, { onError: (err) => toast.error(errorMessage(err)) })}
        >
          {(Object.keys(statusLabels) as ConversationStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        {members && members.length > 0 ? (
          <>
            <label className="sr-only" htmlFor="thread-assignee">
              Assignee
            </label>
            <select
              id="thread-assignee"
              className={cn(selectClassName, "h-8 w-auto max-w-36 rounded-lg py-0 text-xs")}
              value={c.assigneeId ?? ""}
              onChange={(e) => setAssignee.mutate({ id: c.id, userId: e.target.value || null }, { onError: (err) => toast.error(errorMessage(err)) })}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Mark as unread"
          title="Mark as unread"
          onClick={() => {
            setUnread.mutate({ id: c.id, unread: true })
            onBack()
          }}
        >
          <MailOpen />
        </Button>
        <Button variant={showNotes ? "secondary" : "ghost"} size="icon-sm" aria-label="Internal notes" title="Internal notes" aria-pressed={showNotes} onClick={() => setShowNotes((v) => !v)}>
          <StickyNote />
        </Button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4 sm:p-6">
        {c.kind === "comment" && c.postTitle ? (
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <NetworkBadge network={c.network} className="ring-0" /> Original post
              </p>
              <p className="truncate text-sm font-medium">{c.postTitle}</p>
            </div>
            {c.postUrl ? (
              <a href={c.postUrl} target="_blank" rel="noreferrer" aria-label="Open original post" className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>
        ) : null}
        {c.messages.map((m) => (
          <div key={m.id} className={cn("flex items-end gap-2", m.from === "brand" && "flex-row-reverse")}>
            {m.from === "contact" ? <PersonAvatar initials={c.contact.initials} color={c.contact.color} size="sm" /> : null}
            <div className={cn("max-w-[80%]", m.from === "brand" && "text-right")}>
              {m.from === "contact" && m.authorName && m.authorName !== c.contact.name ? (
                <p className="mb-0.5 px-1 text-[11px] text-muted-foreground">{m.authorName}</p>
              ) : null}
              <p
                className={cn(
                  "inline-block rounded-2xl px-4 py-2.5 text-left text-sm break-words whitespace-pre-line shadow-sm",
                  m.from === "contact" ? "rounded-bl-md bg-card" : "rounded-br-md bg-ink text-ink-foreground"
                )}
              >
                {m.text}
              </p>
              <p className="mt-1 px-1 text-[11px] text-muted-foreground">{formatWhen(m.sentAt)}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {showNotes ? (
        <section aria-label="Internal notes" className="max-h-48 space-y-2 overflow-y-auto border-t border-border bg-amber-500/5 p-3 sm:px-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Internal notes · only your team sees these</p>
          {c.notes.map((n) => (
            <p key={n.id} className="rounded-xl bg-card px-3 py-2 text-sm">
              {n.text}
              <span className="ml-2 text-[11px] text-muted-foreground">{formatWhen(n.createdAt)}</span>
            </p>
          ))}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!note.trim()) return
              addNote.mutate({ id: c.id, text: note }, { onSuccess: () => setNote(""), onError: (err) => toast.error(errorMessage(err)) })
            }}
          >
            <label htmlFor="note" className="sr-only">
              Add an internal note
            </label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a private note"
              maxLength={2000}
              className="h-9 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button type="submit" size="sm" variant="outline" disabled={!note.trim() || addNote.isPending}>
              Add
            </Button>
          </form>
        </section>
      ) : null}

      <div className="border-t border-border p-3 sm:p-4">
        {!c.reply.allowed ? (
          <p role="status" className="mb-2 flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {c.reply.reason}
          </p>
        ) : null}
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <label htmlFor="reply" className="sr-only">
            Reply
          </label>
          <textarea
            id="reply"
            rows={1}
            value={text}
            disabled={!canReply}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={canReply ? `Reply on ${networks[c.network].name}…` : "Replies are unavailable for this conversation"}
            className="max-h-32 min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-input bg-card px-3.5 py-2 text-sm outline-none field-sizing-content focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button type="submit" variant="ink" size="icon" aria-label="Send reply" disabled={!text.trim() || !canReply || reply.isPending}>
            <Send />
          </Button>
        </form>
      </div>
    </>
  )
}
