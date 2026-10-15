import type { Metadata } from "next"
import { Suspense } from "react"
import { ListSkeleton } from "@/components/dashboard/ui"
import { InboxView } from "@/components/dashboard/inbox-view"

export const metadata: Metadata = { title: "Inbox" }

export default function InboxPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={6} />}>
      <InboxView />
    </Suspense>
  )
}
