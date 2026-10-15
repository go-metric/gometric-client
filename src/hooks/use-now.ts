"use client"

import { useSyncExternalStore } from "react"

let now: Date | null = null
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    timer = setInterval(() => {
      now = new Date()
      for (const l of listeners) l()
    }, 60_000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

function getSnapshot() {
  now ??= new Date()
  return now
}

/**
 * Current time, refreshed every minute. `null` during server rendering so
 * date-dependent UI never mismatches on hydration or blocks prerendering.
 */
export function useNow(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
