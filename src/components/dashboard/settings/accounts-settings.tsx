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
import { Switch } from "@/components/ui/switch"
import { isNetworkId, networks, type NetworkId } from "@/config/networks"
import type { CapabilityFeature, SocialAccount } from "@/lib/api/types"
import { errorMessage } from "@/lib/api/errors"
import { formatAgo, formatCompact } from "@/lib/format"
import { useAccounts, useDisconnectAccount, useReconnectAccount, useSetAccountPreferences } from "@/lib/queries/accounts"

function ago(iso: string | null | undefined) {
  return iso ? formatAgo(iso) + " ago" : "never"
}

export function AccountsSettings() {
  const router = useRouter()
  const params = useSearchParams()
  const { data, error, refetch } = useAccounts()
  const reconnect = useReconnectAccount()
  const disconnect = useDisconnectAccount()
  const setPrefs = useSetAccountPreferences()
  const [connecting, setConnecting] = useState<NetworkId | null>(null)
  const [disconnecting, setDisconnecting] = useState<NetworkId | null>(null)

  useEffect(() => {
    const connected = params.get("connected")
    const failure = params.get("error")
    const warning = params.get("warning")
    if (!connected && !failure) return
    if (connected && isNetworkId(connected)) {
      toast.success(`${networks[connected].name} connected`)
      void refetch()
    }
    if (warning) toast.warning(warning, { duration: 12_000 })
    if (failure) toast.error(failure)
    router.replace("/dashboard/settings/accounts")
  }, [params, refetch, router])

  const connected = data?.filter((a) => a.status !== "disconnected" && a.available !== false) ?? []
  const available = data?.filter((a) => a.status === "disconnected" && a.available !== false) ?? []
  const unavailable = data?.filter((a) => a.available === false) ?? []

  return (
    <Panel title="Accounts" action={data ? <span className="text-xs text-muted-foreground">{connected.length} of {data.length - unavailable.length} connected</span> : null}>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <ListSkeleton rows={6} />
      ) : (
        <ul className="divide-y divide-border">
          {[...connected, ...available, ...unavailable].map((account) => {
            const network = networks[account.network]
            const linked = account.status !== "disconnected" && account.available !== false
            const needsReconnect = account.status === "expiring" || account.status === "expired"
            return (
              <li key={account.network} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                <NetworkTile network={account.network} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{network.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {linked
                      ? `${account.handle} · ${account.followers != null ? `${formatCompact(account.followers)} followers` : "Followers not reported yet"}`
                      : account.available === false
                        ? (account.unavailableReason ?? "Not available yet")
                        : network.accountLabel}
                  </p>
                </div>
                {account.available === false ? (
                  <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px] font-semibold text-foreground/60">Coming soon</span>
                ) : (
                  <AccountStatusBadge status={account.status} />
                )}
                {linked && account.capabilities ? <CapabilityList capabilities={account.capabilities} /> : null}
                {linked && account.preferences ? (
                  <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Switch
                        size="sm"
                        checked={account.preferences.inbox}
                        disabled={setPrefs.isPending}
                        onCheckedChange={(on) =>
                          setPrefs.mutate({ network: account.network, inbox: on }, { onError: (e) => toast.error(errorMessage(e)) })
                        }
                        aria-label={`Include ${network.name} in the inbox`}
                      />
                      Include in inbox
                      <span className="text-[11px]">· synced {ago(account.sync?.inboxAt)}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <Switch
                        size="sm"
                        checked={account.preferences.analytics}
                        disabled={setPrefs.isPending}
                        onCheckedChange={(on) =>
                          setPrefs.mutate({ network: account.network, analytics: on }, { onError: (e) => toast.error(errorMessage(e)) })
                        }
                        aria-label={`Include ${network.name} in analytics`}
                      />
                      Include in analytics
                      <span className="text-[11px]">· collected {ago(account.sync?.analyticsAt)}</span>
                    </label>
                    {account.sync?.inboxError || account.sync?.analyticsError ? (
                      <p role="status" className="w-full text-[11px] text-amber-700 dark:text-amber-300">
                        {[account.sync.inboxError && `Inbox: ${account.sync.inboxError}`, account.sync.analyticsError && `Analytics: ${account.sync.analyticsError}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex w-full justify-end gap-2 sm:w-auto">
                  {needsReconnect && linked ? (
                    <Button
                      size="sm"
                      variant="ink"
                      disabled={reconnect.isPending}
                      onClick={() =>
                        reconnect.mutate(account.network, {
                          onSuccess: (result) => {
                            // Reauthorization redirects; the success toast comes from `?connected=` on return.
                            if (!result.redirected) toast.success(`${network.name} reconnected`)
                          },
                          onError: (e) => toast.error(errorMessage(e)),
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
                  ) : account.available === false ? null : (
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
                  onError: (e) => toast.error(errorMessage(e)),
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
