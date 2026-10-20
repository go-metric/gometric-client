"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { NetworkTile } from "@/components/network"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { networks, type NetworkId } from "@/config/networks"
import { useAccounts, useConnectPinterestSandboxToken, useStartOAuth } from "@/lib/queries/accounts"
import { errorMessage } from "@/lib/api/errors"

/**
 * Starts the service OAuth flow (mock provider today). Continue redirects to the
 * network consent URL returned by GET /accounts/:network/oauth/start.
 */
export function ConnectAccountDialog({ network, onClose }: { network: NetworkId | null; onClose: () => void }) {
  return (
    <Dialog open={!!network} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {network ? <ConnectForm key={network} network={network} onDone={onClose} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ConnectForm({ network, onDone }: { network: NetworkId; onDone: () => void }) {
  const startOAuth = useStartOAuth()
  const { name, accountLabel } = networks[network]
  const accounts = useAccounts()
  // Offered only when the service enables it (app review demos): pins and boards then live in Pinterest's sandbox.
  const sandboxOffered = network === "pinterest" && accounts.data?.find((a) => a.network === "pinterest")?.sandboxAvailable === true
  const [sandbox, setSandbox] = useState(false)
  const connectToken = useConnectPinterestSandboxToken()
  const [token, setToken] = useState("")

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <NetworkTile network={network} size="lg" />
        <DialogTitle className="mt-2 text-lg">Connect {name}</DialogTitle>
        <DialogDescription>
          You&apos;ll sign in with {name} and approve access for your {accountLabel.toLowerCase()}.
        </DialogDescription>
      </DialogHeader>
      <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        gometric never sees your password. You can disconnect at any time.
      </p>
      {sandboxOffered ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm">
          <Checkbox checked={sandbox} onCheckedChange={(on) => setSandbox(on === true)} className="mt-0.5" />
          <span>
            <span className="font-medium">Use the Pinterest sandbox (testing only)</span>
            <span className="block text-xs text-muted-foreground">Boards and pins are created in Pinterest&apos;s sandbox and are only visible to you. Nothing is published publicly.</span>
          </span>
        </label>
      ) : null}
      {sandboxOffered && sandbox ? (
        <div className="grid gap-2 rounded-xl border border-border p-3">
          <label htmlFor="sandbox-token" className="text-sm font-medium">
            Sandbox access token (to create boards and pins)
          </label>
          <p className="text-xs text-muted-foreground">
            Pinterest lets Trial apps write only with a Sandbox token. Generate one in the Pinterest developer portal: My apps, Manage, Configure, Generate access token, Sandbox. Paste it here instead of signing in.
          </p>
          <input
            id="sandbox-token"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste the Sandbox token"
            className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={connectToken.isPending || token.trim().length === 0}
            onClick={() =>
              connectToken.mutate(token, {
                onSuccess: () => {
                  toast.success("Pinterest connected through the sandbox.")
                  setToken("")
                  onDone()
                },
                // Failures are toasted once by the global mutation handler.
              })
            }
          >
            {connectToken.isPending ? "Checking the token…" : "Connect with this token"}
          </Button>
        </div>
      ) : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="ink"
          disabled={startOAuth.isPending}
          onClick={() =>
            startOAuth.mutate(sandboxOffered ? { network, sandbox } : network, {
              onError: (error) => toast.error(errorMessage(error)),
            })
          }
        >
          {startOAuth.isPending ? "Redirecting…" : `Continue to ${name}`}
        </Button>
      </DialogFooter>
    </div>
  )
}
