"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { NetworkTile } from "@/components/network"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { networks, type NetworkId } from "@/config/networks"
import { errorMessage } from "@/lib/api/errors"
import { startOAuth } from "@/lib/queries/accounts"

/** Sends the user to the network's consent screen; the service stores the token on callback. */
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
  const [pending, setPending] = useState(false)
  const { name, accountLabel } = networks[network]

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setPending(true)
        try {
          await startOAuth(network)
        } catch (error) {
          setPending(false)
          toast.error(errorMessage(error))
        }
      }}
    >
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
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="ink" disabled={pending}>
          {pending ? "Redirecting…" : `Continue to ${name}`}
        </Button>
      </DialogFooter>
    </form>
  )
}
