"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { FormField } from "@/components/form-field"
import { NetworkTile } from "@/components/network"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { networks, type NetworkId } from "@/config/networks"
import { activeBrand } from "@/lib/api/workspace"
import { useConnectAccount } from "@/lib/queries/accounts"
import { useWorkspace } from "@/lib/queries/workspace"

/**
 * Stand-in for the OAuth consent screen. In production, "Continue" sends the
 * user to the network and the service handles the callback.
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
  const { data: workspace } = useWorkspace()
  const connect = useConnectAccount()
  const brand = workspace ? activeBrand(workspace) : null
  const [handle, setHandle] = useState(brand?.handle ?? "")
  const { name, accountLabel } = networks[network]

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        connect.mutate(
          { network, handle },
          {
            onSuccess: () => {
              toast.success(`${name} connected`)
              onDone()
            },
          }
        )
      }}
    >
      <DialogHeader>
        <NetworkTile network={network} size="lg" />
        <DialogTitle className="mt-2 text-lg">Connect {name}</DialogTitle>
        <DialogDescription>
          You&apos;ll sign in with {name} and approve access for your {accountLabel.toLowerCase()}.
        </DialogDescription>
      </DialogHeader>
      <FormField id="connect-handle" label="Account" hint="Demo only. The real flow reads this from the network.">
        <Input id="connect-handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourbrand" autoFocus />
      </FormField>
      <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        gometric never sees your password. You can disconnect at any time.
      </p>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="ink" disabled={connect.isPending}>
          {connect.isPending ? "Connecting…" : `Continue to ${name}`}
        </Button>
      </DialogFooter>
    </form>
  )
}
