/** Wall-clock helpers for a brand's IANA timezone. Posts are stored as UTC instants. */

const partsFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })

/** `yyyy-MM-dd` and `HH:mm` of an instant as seen in `timeZone`. */
export function zonedParts(iso: string | Date, timeZone: string) {
  const p = Object.fromEntries(partsFormatter(timeZone).formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}

/** The UTC instant at which the wall clock in `timeZone` reads `date` `time` (handles DST). */
export function zonedTimeToIso(date: string, time: string, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  const wall = Date.UTC(y!, m! - 1, d!, hh!, mm!)
  let guess = wall
  // Two passes converge across DST transitions.
  for (let i = 0; i < 2; i++) {
    const seen = zonedParts(new Date(guess), timeZone)
    const [sy, sm, sd] = seen.date.split("-").map(Number)
    const [sh, smin] = seen.time.split(":").map(Number)
    guess += wall - Date.UTC(sy!, sm! - 1, sd!, sh!, smin!)
  }
  return new Date(guess).toISOString()
}

export const isValidTimeZone = (tz: string) => {
  try {
    partsFormatter(tz)
    return true
  } catch {
    return false
  }
}

export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
