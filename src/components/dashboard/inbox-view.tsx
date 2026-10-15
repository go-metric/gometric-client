"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, CheckCheck, ChevronDown, Inbox, MailOpen, MessageSquareText, RotateCcw, Search, Send } from "lucide-react"
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Segmented } from "@/components/dashboard/ui"
import { NetworkBadge, PersonAvatar } from "@/components/network"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { networkList, networks, type NetworkId } from "@/config/networks"
import type { Conversation, ConversationStatus } from "@/lib/api/types"
import { formatAgo, formatWhen } from "@/lib/format"
import { useConversations, useReply, useSetConversationStatus, useSetUnread } from "@/lib/queries/inbox"
import { useWorkspace } from "@/lib/queries/workspace"
import { cn } from "@/lib/utils"

type KindFilter = "all" | "unread" | "comment" | "dm"

const kindFilters: { value: KindFilter; label: string; match: (c: Conversation) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "unread", label: "Unread", match: (c) => c.unread },
  { value: "comment", label: "Comments", match: (c) => c.kind === "comment" },
  { value: "dm", label: "DMs", match: (c) => c.kind === "dm" },
]

const savedReplies = ["Thanks so much! 🙏", "We'll DM you the details.", "Restocking Friday at 9am!", "Here's the link 👉"]

function selectConversation(id: string | null) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set("c", id)
  else url.searchParams.delete("c")
  window.history.replaceState(null, "", url)
}

export function InboxView() {
  const params = useSearchParams()
  const activeId = params.get("c")
  const { data, error, refetch } = useConversations()
  const setUnread = useSetUnread()
  const [status, setStatus] = useState<ConversationStatus>("open")
  const [kind, setKind] = useState<KindFilter>("all")
  const [network, setNetwork] = useState<NetworkId | "all">("all")
  const [query, setQuery] = useState("")

  const active = data?.find((c) => c.id === activeId) ?? null
  const markRead = setUnread.mutate

  useEffect(() => {
    if (active?.unread) markRead({ id: active.id, unread: false })
  }, [active?.id, active?.unread, markRead])

  const q = query.trim().toLowerCase()
  const kindMatch = kindFilters.find((f) => f.value === kind)!.match
  const visible = (data ?? []).filter(
    (c) =>
      c.status === status &&
      kindMatch(c) &&
      (network === "all" || c.network === network) &&
      (!q || c.contact.name.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)))
  )
  const openUnread = (data ?? []).filter((c) => c.status === "open" && c.unread).length

  return (
    <>
      <PageHeader
        title="Inbox"
        description={data ? `${openUnread} unread across comments and DMs.` : " "}
        actions={
          <Segmented
            label="Conversation status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "open", label: "Open" },
              { value: "done", label: "Done" },
            ]}
          />
        }
      />

      <div className="grid h-[calc(100svh-13rem)] min-h-[32rem] overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className={cn("flex min-h-0 flex-col border-border md:border-r", active && "hidden md:flex")}>
          <div className="space-y-2 border-b border-border p-3">
            <div className="flex gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Search conversations</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-9 w-full rounded-xl border border-input bg-muted/50 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Network"
                  className="inline-flex h-9 w-32 shrink-0 cursor-pointer items-center justify-between gap-1 rounded-xl border border-input bg-muted/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="truncate">{network === "all" ? "All networks" : networks[network].name}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44 rounded-xl p-1.5">
                  <DropdownMenuRadioGroup
                    value={network}
                    onValueChange={(value) => setNetwork(value as NetworkId | "all")}
                  >
                    <DropdownMenuRadioItem value="all" className="py-1.5">
                      All networks
                    </DropdownMenuRadioItem>
                    {networkList.map((n) => (
                      <DropdownMenuRadioItem key={n.id} value={n.id} className="py-1.5">
                        {n.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
            </div>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            {error ? (
              <li>
                <ErrorState error={error} onRetry={() => refetch()} />
              </li>
            ) : !data ? (
              <li className="p-2">
                <ListSkeleton rows={6} />
              </li>
            ) : visible.length === 0 ? (
              <li>
                <EmptyState
                  icon={<Inbox />}
                  title={status === "open" ? "You're all caught up" : "Nothing marked done"}
                  description={q || kind !== "all" || network !== "all" ? "Try clearing the filters." : undefined}
                />
              </li>
            ) : (
              visible.map((c) => {
                const last = c.messages.at(-1)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectConversation(c.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-muted/70",
                        c.id === activeId && "bg-muted"
                      )}
                    >
                      <PersonAvatar initials={c.contact.initials} color={c.contact.color} network={c.network} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{c.contact.name}</p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{formatAgo(c.updatedAt)}</span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.kind === "dm" ? "Direct message" : `Comment on “${c.postTitle}”`}
                        </p>
                        <p className={cn("mt-0.5 line-clamp-1 text-sm", !c.unread && "text-muted-foreground")}>
                          {last?.from === "brand" ? "You: " : ""}
                          {last?.text}
                        </p>
                      </div>
                      {c.unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" /> : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        <div className={cn("min-h-0 flex-col", active ? "flex" : "hidden md:flex")}>
          {active ? (
            <Thread key={active.id} conversation={active} onBack={() => selectConversation(null)} />
          ) : (
            <EmptyState icon={<MessageSquareText />} title="Select a conversation" className="flex-1" />
          )}
        </div>
      </div>
    </>
  )
}

function Thread({ conversation: c, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { data: workspace } = useWorkspace()
  const reply = useReply()
  const setStatus = useSetConversationStatus()
  const setUnread = useSetUnread()
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [c.messages.length])

  const send = () => {
    if (!text.trim()) return
    reply.mutate({ id: c.id, text }, { onSuccess: () => setText("") })
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border p-3 sm:p-4">
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
        {c.status === "open" ? (
          <Button variant="outline" size="sm" onClick={() => setStatus.mutate({ id: c.id, status: "done" })}>
            <CheckCheck data-icon="inline-start" />
            <span className="hidden sm:inline">Mark done</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setStatus.mutate({ id: c.id, status: "open" })}>
            <RotateCcw data-icon="inline-start" />
            <span className="hidden sm:inline">Reopen</span>
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4 sm:p-6">
        {c.kind === "comment" && c.postTitle ? (
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <span className="size-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-lime-400" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <NetworkBadge network={c.network} className="ring-0" /> Original post
              </p>
              <p className="truncate text-sm font-medium">{c.postTitle}</p>
            </div>
          </div>
        ) : null}
        {c.messages.map((m) => (
          <div key={m.id} className={cn("flex items-end gap-2", m.from === "brand" && "flex-row-reverse")}>
            {m.from === "contact" ? <PersonAvatar initials={c.contact.initials} color={c.contact.color} size="sm" /> : null}
            <div className={cn("max-w-[80%]", m.from === "brand" && "text-right")}>
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

      <div className="border-t border-border p-3 sm:p-4">
        <div className="mb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {savedReplies.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setText((t) => (t ? `${t} ${r}` : r))
                inputRef.current?.focus()
              }}
              className="shrink-0 cursor-pointer rounded-full border border-border px-3 py-1 text-xs text-foreground/75 hover:border-foreground/40"
            >
              {r}
            </button>
          ))}
        </div>
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
            ref={inputRef}
            id="reply"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={`Reply as ${workspace?.brands.find((b) => b.id === workspace.activeBrandId)?.name ?? "your brand"}…`}
            className="max-h-32 min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-input bg-card px-3.5 py-2 text-sm outline-none field-sizing-content focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" variant="ink" size="icon" aria-label="Send reply" disabled={!text.trim() || reply.isPending}>
            <Send />
          </Button>
        </form>
      </div>
    </>
  )
}
