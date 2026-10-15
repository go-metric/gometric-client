"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LayoutGrid } from "lucide-react"
import { NetworkTile } from "@/components/network"
import { networkThemes } from "@/config/network-themes"
import { networkList, type NetworkId } from "@/config/networks"
import { routes } from "@/config/site"
import type { SocialAccount } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export type AnalyticsTab = NetworkId | "all"

const tabClass =
  "-mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors"

/** Links between the combined view and each network's own route. */
export function NetworkTabs({ value, accounts }: { value: AnalyticsTab; accounts: SocialAccount[] | undefined }) {
  const connected = new Set(accounts?.filter((a) => a.status !== "disconnected").map((a) => a.network))
  // Connected networks first; the rest stay reachable so people can see what they'd unlock.
  const ordered = [...networkList].sort((a, b) => Number(connected.has(b.id)) - Number(connected.has(a.id)))

  const listRef = useRef<HTMLElement>(null)

  // Nine tabs don't always fit, so the strip scrolls; fade whichever edge has more tabs behind it.
  const [edges, setEdges] = useState({ start: false, end: false })
  const updateEdges = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const start = list.scrollLeft > 4
    const end = list.scrollLeft + list.clientWidth < list.scrollWidth - 4
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    updateEdges()
    const observer = new ResizeObserver(updateEdges)
    observer.observe(list)
    return () => observer.disconnect()
  }, [updateEdges])

  // Keep the current tab visible after navigating.
  useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector<HTMLElement>("[aria-current=page]")
    if (!list || !current) return
    const { left, right } = current.getBoundingClientRect()
    const bounds = list.getBoundingClientRect()
    if (left < bounds.left || right > bounds.right) {
      list.scrollTo({ left: current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2, behavior: "smooth" })
    }
  }, [value, accounts])

  const mask = `linear-gradient(to right, ${edges.start ? "transparent, #000 2rem" : "#000, #000"}, ${edges.end ? "#000 calc(100% - 2rem), transparent" : "#000, #000"})`

  return (
    <nav
      ref={listRef}
      aria-label="Analytics view"
      onScroll={updateEdges}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className="relative mb-6 flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href={routes.dashboard.analytics}
        aria-current={value === "all" ? "page" : undefined}
        className={cn(
          tabClass,
          value === "all" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-4" />
        All networks
      </Link>
      {ordered.map((n) => {
        const active = value === n.id
        return (
          <Link
            key={n.id}
            href={routes.dashboard.analyticsNetwork(n.id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              tabClass,
              active ? "text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              !active && !connected.has(n.id) && "opacity-50 hover:opacity-100"
            )}
            style={active ? { borderColor: networkThemes[n.id].accent } : undefined}
          >
            <NetworkTile network={n.id} size="sm" className="size-6 rounded-md [&_svg]:size-3" />
            {n.name}
          </Link>
        )
      })}
    </nav>
  )
}
