import type { Metadata } from "next"
import { Suspense } from "react"
import { ListSkeleton } from "@/components/dashboard/ui"
import { Composer } from "@/components/dashboard/composer"

export const metadata: Metadata = { title: "Compose" }

export default function ComposePage() {
  return (
    <Suspense fallback={<ListSkeleton rows={6} />}>
      <Composer />
    </Suspense>
  )
}
