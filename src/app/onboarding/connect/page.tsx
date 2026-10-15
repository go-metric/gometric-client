import type { Metadata } from "next"
import { Suspense } from "react"
import { ListSkeleton } from "@/components/dashboard/ui"
import { Accent } from "@/components/marketing/primitives"
import { ConnectNetworks } from "@/components/onboarding/connect-networks"
import { StepHeading } from "@/components/onboarding/step-heading"

export const metadata: Metadata = { title: "Connect your accounts" }

export default function ConnectAccountsPage() {
  return (
    <>
      <StepHeading
        step="Step 2 of 3"
        title={
          <>
            Connect your <Accent>networks</Accent>
          </>
        }
        description="Link the accounts this brand posts to. You can add or remove them any time in Settings."
      />
      <Suspense fallback={<ListSkeleton rows={5} className="mt-10" />}>
        <ConnectNetworks />
      </Suspense>
    </>
  )
}
