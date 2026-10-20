import type { ReportFrequency, ReportSchedule, ReportSection } from "@/lib/api/types"

export const sectionLabels: Record<ReportSection, string> = {
  summary: "Summary",
  networks: "By network",
  trends: "Trends",
  posts: "Top posts",
  audience: "Audience",
}
export const allSections = Object.keys(sectionLabels) as ReportSection[]

export const rangeOptions = [
  { days: 7, label: "Last 7 days" },
  { days: 14, label: "Last 14 days" },
  { days: 28, label: "Last 28 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
]

export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

export const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`

export function cadenceLabel(s: Pick<ReportSchedule, "frequency" | "weekday" | "dayOfMonth" | "hour" | "rangeDays">) {
  const when = s.frequency === "weekly" ? `Every ${weekdays[s.weekday - 1] ?? "Monday"}` : `Monthly on the ${ordinal(s.dayOfMonth)}`
  return `${when} at ${hourLabel(s.hour)} · last ${s.rangeDays} days`
}

/** Splits pasted recipients on commas, spaces and newlines and drops blanks and duplicates. */
export function parseRecipients(raw: string) {
  return [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))]
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export type { ReportFrequency }
