"use client"

import { useEffect } from "react"
import { ErrorView } from "@/components/error-view"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorView onRetry={retry} digest={error.digest} />
}
