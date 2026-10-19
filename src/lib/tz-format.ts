import { format } from "date-fns"
import { zonedParts } from "@/lib/tz"

/** Formats an instant using the wall clock of `timeZone`, with date-fns tokens. */
export function formatInZone(iso: string | Date, timeZone: string, pattern: string) {
  const { date, time } = zonedParts(iso, timeZone)
  return format(new Date(`${date}T${time}:00`), pattern)
}

/** "Today 09:00", "Tomorrow 13:30", or "Thu, Oct 16 · 18:00", relative to the same timezone. */
export function formatWhenInZone(iso: string | Date, timeZone: string, now: Date = new Date()) {
  const day = zonedParts(iso, timeZone)
  const today = zonedParts(now, timeZone).date
  const tomorrow = zonedParts(new Date(now.getTime() + 86_400_000), timeZone).date
  const yesterday = zonedParts(new Date(now.getTime() - 86_400_000), timeZone).date
  if (day.date === today) return `Today ${day.time}`
  if (day.date === tomorrow) return `Tomorrow ${day.time}`
  if (day.date === yesterday) return `Yesterday ${day.time}`
  return `${formatInZone(iso, timeZone, "EEE, MMM d")} · ${day.time}`
}
