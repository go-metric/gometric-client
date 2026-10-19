"use client"

import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog"
import { ErrorState, ListSkeleton } from "@/components/dashboard/ui"
import { NetworkTile } from "@/components/network"
import { Button, ButtonLink } from "@/components/ui/button"
import { networks, type NetworkId } from "@/config/networks"
import { routes } from "@/config/site"
import { useAccounts } from "@/lib/queries/accounts"
import { cn } from "@/lib/utils"

export function ConnectNetworks() {
  const { data, error, refetch } = useAccounts()
  const [connecting, setConnecting] = useState<NetworkId | null>(null)

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data) return <ListSkeleton rows={6} className="mt-10" />

  const linked = data.filter((a) => a.status !== "disconnected" && a.available !== false).length

  return (
    <div className="mt-10">
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.map((account) => {
          const network = networks[account.network]
          const isOn = account.status !== "disconnected"
          return (
            <li
              key={account.network}
              className={cn(
                "flex items-center gap-3.5 rounded-2xl border bg-card p-4 transition-colors",
                isOn ? "border-brand/50" : "border-border"
              )}
            >
              <NetworkTile network={account.network} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{network.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {account.available === false ? "Not integrated yet" : isOn ? account.handle : network.accountLabel}
                </p>
              </div>
              {account.available === false ? (
                <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px] font-semibold text-foreground/60">Coming soon</span>
              ) : isOn ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="size-3.5" strokeWidth={3} />
                  Connected
                </span>
              ) : (
                <Button size="sm" variant="ink" onClick={() => setConnecting(account.network)}>
                  <Plus data-icon="inline-start" />
                  Connect
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        You&apos;ll sign in with each network and approve access. We never see your passwords.
      </p>

      <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
        <ButtonLink variant="ghost" href={routes.onboarding.ready}>
          Skip for now
        </ButtonLink>
        <ButtonLink variant="ink" size="lg" className="w-full rounded-xl sm:w-auto" href={routes.onboarding.ready}>
          Continue{linked ? ` with ${linked} connected` : ""}
        </ButtonLink>
      </div>

      <ConnectAccountDialog network={connecting} onClose={() => setConnecting(null)} />
    </div>
  )
}
