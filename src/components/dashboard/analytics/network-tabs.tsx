"use client"

import { LayoutGrid } from "lucide-react"
import { NetworkTile } from "@/components/network"
import { networkThemes } from "@/config/network-themes"
import { networkList, type NetworkId } from "@/config/networks"
import type { SocialAccount } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export type AnalyticsTab = NetworkId | "all"

const tabClass =
  "-mb-px inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors"

/** Switches between the combined view and each network's own dashboard. */
export function NetworkTabs({
  value,
  onChange,
  accounts,
}: {
  value: AnalyticsTab
  onChange: (tab: AnalyticsTab) => void
  accounts: SocialAccount[] | undefined
}) {
  const connected = new Set(accounts?.filter((a) => a.status !== "disconnected").map((a) => a.network))
  // Connected networks first; the rest stay reachable so people can see what they'd unlock.
  const ordered = [...networkList].sort((a, b) => Number(connected.has(b.id)) - Number(connected.has(a.id)))

  return (
    <div
      role="tablist"
      aria-label="Analytics view"
      className="mb-6 flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "all"}
        onClick={() => onChange("all")}
        className={cn(
          tabClass,
          value === "all" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-4" />
        All networks
      </button>
      {ordered.map((n) => {
        const active = value === n.id
        return (
          <button
            key={n.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(n.id)}
            className={cn(
              tabClass,
              active ? "text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              !active && !connected.has(n.id) && "opacity-50 hover:opacity-100"
            )}
            style={active ? { borderColor: networkThemes[n.id].accent } : undefined}
          >
            <NetworkTile network={n.id} size="sm" className="size-6 rounded-md [&_svg]:size-3" />
            {n.name}
          </button>
        )
      })}
    </div>
  )
}
