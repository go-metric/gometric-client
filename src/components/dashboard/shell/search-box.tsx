"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, CornerDownLeft, Search } from "lucide-react"
import { dashboardFooterNav, dashboardNav } from "@/components/dashboard/nav"
import { NetworkBadge, PersonAvatar } from "@/components/network"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { formatWhen } from "@/lib/format"
import { postDate, postTitle } from "@/lib/posts"
import { useConversations } from "@/lib/queries/inbox"
import { usePosts } from "@/lib/queries/posts"
import { cn } from "@/lib/utils"

type Result = { id: string; group: string; href: string; label: string; hint?: string; icon: ReactNode }

const MAX_PER_GROUP = 5

export function SearchBox() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const { data: posts = [] } = usePosts()
  const { data: conversations = [] } = useConversations()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setExpanded(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const pages = [...dashboardNav, ...dashboardFooterNav]
      .filter((p) => p.label.toLowerCase().includes(q))
      .map((p) => ({ id: p.href, group: "Pages", href: p.href, label: p.label, icon: <p.Icon className="size-4" /> }))
    const postResults = posts
      .filter((p) => p.body.toLowerCase().includes(q))
      .slice(0, MAX_PER_GROUP)
      .map((p) => {
        const date = postDate(p)
        return {
          id: p.id,
          group: "Posts",
          href: p.status === "published" ? routes.dashboard.planner : `${routes.dashboard.compose}?post=${p.id}`,
          label: postTitle(p),
          hint: date ? formatWhen(date) : "Draft",
          icon: p.networks[0] ? <NetworkBadge network={p.networks[0]} className="ring-0" /> : null,
        }
      })
    const conversationResults = conversations
      .filter(
        (c) =>
          c.contact.name.toLowerCase().includes(q) ||
          c.messages.some((m) => m.text.toLowerCase().includes(q))
      )
      .slice(0, MAX_PER_GROUP)
      .map((c) => ({
        id: c.id,
        group: "Messages",
        href: `${routes.dashboard.inbox}?c=${c.id}`,
        label: c.contact.name,
        hint: c.messages.at(-1)?.text,
        icon: <PersonAvatar initials={c.contact.initials} color={c.contact.color} size="sm" />,
      }))
    return [...pages, ...postResults, ...conversationResults]
  }, [query, posts, conversations])

  const showPanel = open && query.trim().length > 0

  const reset = () => {
    setOpen(false)
    setExpanded(false)
    setQuery("")
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Search"
        className="sm:hidden"
        onClick={() => {
          setExpanded(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
      >
        <Search />
      </Button>

      <div
        className={cn(
          "absolute inset-x-0 top-0 z-10 h-16 items-center gap-2 bg-card px-3 sm:static sm:flex sm:h-auto sm:max-w-md sm:flex-1 sm:bg-transparent sm:px-0",
          expanded ? "flex" : "hidden"
        )}
      >
        <Button variant="ghost" size="icon-sm" aria-label="Close search" className="sm:hidden" onClick={() => { reset(); inputRef.current?.blur() }}>
          <ArrowLeft />
        </Button>
        <div className="relative flex-1">
          <label htmlFor="dashboard-search" className="sr-only">
            Search
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            id="dashboard-search"
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls="dashboard-search-results"
            autoComplete="off"
            value={query}
            placeholder="Search posts, messages…"
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlight(0)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { reset(); inputRef.current?.blur() }
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setHighlight((h) => Math.min(h + 1, results.length - 1))
              }
              if (e.key === "ArrowUp") {
                e.preventDefault()
                setHighlight((h) => Math.max(h - 1, 0))
              }
              if (e.key === "Enter" && results[highlight]) { router.push(results[highlight].href); reset(); inputRef.current?.blur() }
            }}
            className="h-9 w-full rounded-xl border border-input bg-muted/50 pr-14 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-border px-1.5 text-[10px] text-muted-foreground sm:block">
            Ctrl K
          </kbd>

          {showPanel ? (
            <div
              id="dashboard-search-results"
              role="listbox"
              className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(28rem,70svh)] overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-xl"
            >
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results for “{query}”.</p>
              ) : (
                results.map((r, i) => (
                  <div key={`${r.group}-${r.id}`}>
                    {i === 0 || results[i - 1].group !== r.group ? (
                      <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        {r.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === highlight}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { router.push(r.href); reset(); inputRef.current?.blur() }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left aria-selected:bg-muted"
                    >
                      <span className="inline-flex w-8 shrink-0 justify-center text-muted-foreground">{r.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.label}</span>
                        {r.hint ? <span className="block truncate text-xs text-muted-foreground">{r.hint}</span> : null}
                      </span>
                      {i === highlight ? <CornerDownLeft className="size-3.5 text-muted-foreground" /> : null}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
