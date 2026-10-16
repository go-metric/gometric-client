import type { Metadata } from "next"
import { Suspense } from "react"
import { AccountsSettings } from "@/components/dashboard/settings/accounts-settings"
import { ListSkeleton } from "@/components/dashboard/ui"

export const metadata: Metadata = { title: "Connected accounts" }

export default function ConnectedAccountsPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={6} />}>
      <AccountsSettings />
    </Suspense>
  )
}
