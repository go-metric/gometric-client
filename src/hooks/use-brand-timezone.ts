"use client"

import { activeBrand } from "@/lib/api/workspace"
import { browserTimeZone, isValidTimeZone } from "@/lib/tz"
import { useWorkspace } from "@/lib/queries/workspace"

/** Timezone the active brand schedules in; falls back to the browser's until the workspace loads. */
export function useBrandTimeZone() {
  const { data } = useWorkspace()
  const tz = data ? activeBrand(data)?.timezone : undefined
  return tz && isValidTimeZone(tz) ? tz : browserTimeZone()
}
