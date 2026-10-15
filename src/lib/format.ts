import { format, formatDistanceToNowStrict, isToday, isTomorrow, isYesterday } from "date-fns"

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export function formatCompact(value: number) {
  return compact.format(value)
}

const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
const usdCompact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 })

/** Money in USD: cents for small amounts ("$4.12"), whole dollars in the hundreds, compact beyond 10K ("$12.3K"). */
export function formatCurrency(value: number) {
  if (Math.abs(value) >= 10_000) return usdCompact.format(value)
  return (Math.abs(value) < 100 ? usdCents : usdWhole).format(value)
}

/** Chart axis labels: no stray ".00" on round tick values. */
export function formatCurrencyAxis(value: number) {
  if (Math.abs(value) >= 1000) return usdCompact.format(value)
  return (Number.isInteger(value) ? usdWhole : usdCents).format(value)
}

/** 95 -> "1m 35s", 42 -> "42s". */
export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return m ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`
}

export function formatChange(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`
}

export function formatTime(iso: string) {
  return format(new Date(iso), "HH:mm")
}

/** "Today 09:00", "Tomorrow 13:30", or "Thu, Oct 16 · 18:00". */
export function formatWhen(iso: string) {
  const date = new Date(iso)
  const time = format(date, "HH:mm")
  if (isToday(date)) return `Today ${time}`
  if (isTomorrow(date)) return `Tomorrow ${time}`
  if (isYesterday(date)) return `Yesterday ${time}`
  return `${format(date, "EEE, MMM d")} · ${time}`
}

/** "2m", "3h", "4d". */
export function formatAgo(iso: string) {
  return formatDistanceToNowStrict(new Date(iso))
    .replace(/ seconds?/, "s")
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ months?/, "mo")
    .replace(/ years?/, "y")
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  )
}
