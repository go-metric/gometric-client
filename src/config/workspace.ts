export const industries = [
  { value: "retail", label: "Retail & e-commerce" },
  { value: "food", label: "Food & hospitality" },
  { value: "creative", label: "Creative & media" },
  { value: "services", label: "Professional services" },
  { value: "other", label: "Other" },
]

export type TimezoneOption = { value: string; label: string }

/** Offset in minutes east of UTC for sorting (DST-aware for "now"). */
function offsetMinutes(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(at)
  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT"
  if (raw === "GMT" || raw === "UTC") return 0
  const match = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!match) return 0
  const sign = match[1] === "-" ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

function offsetLabel(minutes: number): string {
  if (minutes === 0) return "GMT"
  const sign = minutes < 0 ? "−" : "+"
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return m === 0 ? `GMT${sign}${h}` : `GMT${sign}${h}:${String(m).padStart(2, "0")}`
}

function cityLabel(timeZone: string): string {
  const segment = timeZone.split("/").pop() ?? timeZone
  return segment.replace(/_/g, " ")
}

function buildTimezones(): TimezoneOption[] {
  const at = new Date()
  const zones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : ["UTC", "Asia/Karachi", "Asia/Dubai", "Europe/London", "America/New_York"]

  return zones
    .map((value) => {
      const minutes = offsetMinutes(value, at)
      return {
        value,
        label: `(${offsetLabel(minutes)}) ${cityLabel(value)}`,
        minutes,
      }
    })
    .sort((a, b) => a.minutes - b.minutes || a.label.localeCompare(b.label))
    .map(({ value, label }) => ({ value, label }))
}

/** All IANA time zones, labeled with current GMT offset and city. */
export const timezones: TimezoneOption[] = buildTimezones()
