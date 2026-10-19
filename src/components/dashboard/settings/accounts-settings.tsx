"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog"
import { AccountStatusBadge, ErrorState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { NetworkTile } from "@/components/network"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { isNetworkId, networks, type NetworkId } from "@/config/networks"
import type { CapabilityFeature, SocialAccount } from "@/lib/api/types"
import { formatCompact } from "@/lib/format"
import { useAccounts, useDisconnectAccount, useReconnectAccount } from "@/lib/queries/accounts"

export function AccountsSettings() {
  const router = useRouter()
  const params = useSearchParams()
  const { data, error, refetch } = useAccounts()
  const reconnect = useReconnectAccount()
  const disconnect = useDisconnectAccount()
  const [connecting, setConnecting] = useState<NetworkId | null>(null)
  const [disconnecting, setDisconnecting] = useState<NetworkId | null>(null)

  useEffect(() => {
    const connected = params.get("connected")
    if (!connected || !isNetworkId(connected)) return
    toast.success(`${networks[connected].name} connected`)
    void refetch()
    router.replace("/dashboard/settings/accounts")
  }, [params, refetch, router])

  const connected = data?.filter((a) => a.status !== "disconnected") ?? []
  const available = data?.filter((a) => a.status === "disconnected") ?? []

  return (
    <Panel title="Accounts" action={data ? <span className="text-xs text-muted-foreground">{connected.length} of {data.length} connected</span> : null}>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <ListSkeleton rows={6} />
      ) : (
        <ul className="divide-y divide-border">
          {[...connected, ...available].map((account) => {
            const network = networks[account.network]
            const linked = account.status !== "disconnected"
            return (
              <li key={account.network} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                <NetworkTile network={account.network} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{network.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {linked
                      ? `${account.handle} · ${account.followers ? `${formatCompact(account.followers)} followers` : "Syncing followers…"}`
                      : network.accountLabel}
                  </p>
                </div>
                <AccountStatusBadge status={account.status} />
                {linked && account.capabilities ? <CapabilityList capabilities={account.capabilities} /> : null}
                <div className="flex w-full justify-end gap-2 sm:w-auto">
                  {account.status === "expiring" || account.status === "expired" ? (
                    <Button
                      size="sm"
                      variant="ink"
                      disabled={reconnect.isPending}
                      onClick={() =>
                        reconnect.mutate(account.network, {
                          onSuccess: (result) => {
                            // Meta reconnect redirects; success toast comes from `?connected=` on return.
                            if (!result.redirected) toast.success(`${network.name} reconnected`)
                          },
                        })
                      }
                    >
                      <RefreshCw data-icon="inline-start" />
                      Reconnect
                    </Button>
                  ) : null}
                  {linked ? (
                    <Button size="sm" variant="outline" onClick={() => setDisconnecting(account.network)}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" variant="ink" onClick={() => setConnecting(account.network)}>
                      Connect
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConnectAccountDialog network={connecting} onClose={() => setConnecting(null)} />

      <AlertDialog open={!!disconnecting} onOpenChange={(open) => !open && setDisconnecting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {disconnecting ? networks[disconnecting].name : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              Scheduled posts will no longer publish there, and its messages and analytics will stop syncing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={disconnect.isPending}
              onClick={() => {
                if (!disconnecting) return
                const name = networks[disconnecting].name
                disconnect.mutate(disconnecting, {
                  onSuccess: () => {
                    toast.success(`${name} disconnected`)
                    setDisconnecting(null)
                  },
                })
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  )
}

const featureLabels: Record<CapabilityFeature, string> = {
  publish: "Publish",
  delete_post: "Delete posts",
  comments_read: "Read comments",
  comments_reply: "Reply to comments",
  dm_read: "Read messages",
  dm_reply: "Reply to messages",
  insights_account: "Account analytics",
  insights_posts: "Post analytics",
}

/** Per-feature availability so users can see why something is or isn't possible. */
function CapabilityList({ capabilities }: { capabilities: NonNullable<SocialAccount["capabilities"]> }) {
  return (
    <ul className="flex w-full flex-wrap gap-1.5" aria-label="Supported features">
      {(Object.keys(featureLabels) as CapabilityFeature[]).map((feature) => {
        const cap = capabilities[feature]
        const title =
          cap.state === "unsupported"
            ? cap.reason
            : cap.state === "needs_reauthorization"
              ? `Reconnect to grant: ${cap.missingScopes.join(", ")}${cap.note ? `. ${cap.note}` : ""}`
              : (cap.note ?? "Available")
        const tone =
          cap.state === "available"
            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
            : cap.state === "needs_reauthorization"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "bg-foreground/8 text-foreground/50 line-through"
        return (
          <li key={feature} title={title} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
            {featureLabels[feature]}
          </li>
        )
      })}
    </ul>
  )
}
