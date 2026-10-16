/**
 * Static demo content for design previews (marketing mocks + dashboard seed).
 * Replace with API data once the service endpoints exist.
 */
import type { NetworkId } from "@/config/networks"

export const demoBrand = {
  name: "Northwind Studio",
  handle: "@northwind",
  initials: "NW",
  owner: { name: "Emily Carter", email: "emily@northwind.co", initials: "EC" },
}

export const weekDays = [
  { short: "Mon", date: 12 },
  { short: "Tue", date: 13 },
  { short: "Wed", date: 14 },
  { short: "Thu", date: 15 },
  { short: "Fri", date: 16 },
  { short: "Sat", date: 17 },
  { short: "Sun", date: 18 },
] as const

export const todayIndex = 3

export const timeSlots = ["09:00", "13:00", "18:00"] as const

export type PostStatus = "scheduled" | "published" | "draft"

export type ScheduledPost = {
  id: string
  day: number
  slot: number
  network: NetworkId
  time: string
  title: string
  body: string
  status: PostStatus
}

/** A full, believable week: Mon–Thu already out, Fri–Sun lined up. */
export const scheduledPosts: ScheduledPost[] = [
  { id: "p1", day: 0, slot: 0, network: "linkedin", time: "09:00", title: "Hiring: Design lead", body: "We're growing the studio team and looking for…", status: "published" },
  { id: "p2", day: 0, slot: 1, network: "instagram", time: "13:30", title: "Studio tour 🎥", body: "Come see where the magic happens, one bench at a time…", status: "published" },
  { id: "p3", day: 0, slot: 2, network: "facebook", time: "18:00", title: "Weekend recap", body: "Thank you to everyone who joined us at the flagship…", status: "published" },
  { id: "p4", day: 1, slot: 0, network: "x", time: "09:15", title: "Thread: 5 lessons", body: "What we learned shipping something every week…", status: "published" },
  { id: "p5", day: 1, slot: 1, network: "instagram", time: "13:30", title: "New drop ✦", body: "The autumn edit is live in stores and online…", status: "published" },
  { id: "p6", day: 1, slot: 2, network: "youtube", time: "18:00", title: "Workshop vlog #12", body: "A full day making the rust jacket, start to finish…", status: "published" },
  { id: "p7", day: 2, slot: 0, network: "linkedin", time: "08:45", title: "Q3 studio recap", body: "A look back at a busy quarter for the team…", status: "published" },
  { id: "p8", day: 2, slot: 1, network: "tiktok", time: "12:30", title: "Packing orders ASMR", body: "Satisfying, slightly chaotic, very autumn…", status: "published" },
  { id: "p9", day: 2, slot: 2, network: "instagram", time: "18:30", title: "Reel: styling tips", body: "Three ways to wear the rust jacket this week…", status: "published" },
  { id: "p10", day: 3, slot: 0, network: "x", time: "09:00", title: "Poll: favourite colourway?", body: "Rust, olive or oat? Tell us below…", status: "published" },
  { id: "p11", day: 3, slot: 1, network: "facebook", time: "13:00", title: "Weekend event", body: "Join us Saturday from 10am at the flagship…", status: "scheduled" },
  { id: "p12", day: 3, slot: 2, network: "tiktok", time: "18:00", title: "Behind the scenes", body: "60 seconds in the workshop with the team…", status: "scheduled" },
  { id: "p13", day: 4, slot: 0, network: "instagram", time: "09:00", title: "The autumn edit 🍂", body: "Rust, olive and warm neutrals, made to layer…", status: "scheduled" },
  { id: "p14", day: 4, slot: 1, network: "linkedin", time: "12:45", title: "How we plan a drop", body: "Our six-week process, from sketch to shelf…", status: "scheduled" },
  { id: "p15", day: 4, slot: 2, network: "youtube", time: "18:00", title: "Autumn lookbook (4K)", body: "Twelve looks, one weekend, zero filters…", status: "scheduled" },
  { id: "p16", day: 5, slot: 1, network: "facebook", time: "12:00", title: "Saturday at the flagship", body: "Coffee on us from 10am. Come say hi…", status: "scheduled" },
  { id: "p17", day: 5, slot: 2, network: "threads", time: "19:00", title: "Sunday vibes", body: "Slow mornings, good coffee, and a new playlist…", status: "draft" },
  { id: "p18", day: 6, slot: 0, network: "instagram", time: "10:00", title: "Customer spotlight", body: "Meet Ana, who built her studio from scratch…", status: "scheduled" },
  { id: "p19", day: 6, slot: 1, network: "tiktok", time: "14:00", title: "Get ready with me", body: "Sunday reset, outfit planning and a cosy playlist…", status: "scheduled" },
]

export type Message = {
  id: string
  name: string
  initials: string
  color: string
  network: NetworkId
  kind: "comment" | "dm"
  text: string
  context: string
  time: string
  unread?: boolean
}

export const messages: Message[] = [
  { id: "m1", name: "Lena Moritz", initials: "LM", color: "#8b5cf6", network: "instagram", kind: "comment", text: "Is the autumn edit back in stock? The rust jacket sold out so fast 😭", context: "Comment on “New drop ✦”", time: "2m", unread: true },
  { id: "m2", name: "Dev Kapoor", initials: "DK", color: "#0ea5e9", network: "linkedin", kind: "comment", text: "Loved the hiring post, just sent my CV!", context: "Comment on “Hiring: Design lead”", time: "14m", unread: true },
  { id: "m3", name: "Sofia Alves", initials: "SA", color: "#f59e0b", network: "facebook", kind: "dm", text: "What time does Saturday start?", context: "Direct message", time: "1h", unread: true },
  { id: "m4", name: "Jo Tanaka", initials: "JT", color: "#10b981", network: "tiktok", kind: "comment", text: "Song name please 🙏", context: "Comment on “Packing orders ASMR”", time: "2h", unread: true },
  { id: "m5", name: "Marcus Bell", initials: "MB", color: "#ef4444", network: "x", kind: "dm", text: "Would love to feature you on our podcast next month.", context: "Direct message", time: "5h" },
  { id: "m6", name: "Ines Duarte", initials: "ID", color: "#14b8a6", network: "youtube", kind: "comment", text: "The jacket walkthrough was so satisfying to watch. More of these please!", context: "Comment on “Workshop vlog #12”", time: "8h" },
  { id: "m7", name: "Priya Shah", initials: "PS", color: "#ec4899", network: "threads", kind: "comment", text: "This playlist is everything ☕️", context: "Reply to “Sunday vibes”", time: "1d" },
]

/** Combined, last 30 days. Keep in step with the dashboard numbers. */
export const kpis = [
  { label: "Followers", value: "65.4K", delta: "+13.1%", points: [12, 14, 13, 17, 16, 21, 20, 24, 27, 26, 31] },
  { label: "Reach", value: "647.6K", delta: "+18.1%", points: [5, 7, 6, 9, 8, 11, 13, 12, 15, 14, 17] },
  { label: "Engagement rate", value: "6%", delta: "+11.3%", points: [6, 5, 7, 7, 8, 7, 9, 10, 9, 10, 11] },
  { label: "Link clicks", value: "18.4K", delta: "+18.1%", points: [3, 4, 4, 6, 5, 8, 9, 11, 12, 11, 14] },
]

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

/** Daily impressions (in thousands) for the marketing analytics chart: Instagram, TikTok, YouTube. */
const dailyImpressions: [number, number, number][] = [
  [18.2, 13.1, 6.4],
  [19.6, 14.4, 6.9],
  [17.8, 15.2, 6.6],
  [21.4, 16.8, 7.4],
  [23.1, 15.9, 7.8],
  [20.7, 18.4, 8.1],
  [22.5, 19.7, 8.4],
  [25.3, 18.8, 8.9],
  [24.1, 21.6, 9.3],
  [27.8, 22.9, 9.1],
  [26.4, 24.7, 9.8],
  [29.6, 23.8, 10.4],
  [31.2, 26.5, 10.9],
  [33.5, 28.1, 11.6],
]

export const impressionsSeries = dailyImpressions.map(([instagram, tiktok, youtube], i) => {
  const date = new Date(Date.UTC(2026, 9, 2 + i))
  const day = date.getUTCDate()
  const weekday = weekdayNames[date.getUTCDay()]
  return {
    label: `Oct ${day}`,
    detail: `${weekday}, Oct ${day}`,
    values: { instagram: instagram * 1000, tiktok: tiktok * 1000, youtube: youtube * 1000 },
  }
})

export const networkShare: { network: NetworkId; share: number; followers: string }[] = [
  { network: "instagram", share: 37, followers: "22.1K" },
  { network: "tiktok", share: 36, followers: "14.9K" },
  { network: "youtube", share: 14, followers: "8.6K" },
  { network: "linkedin", share: 5, followers: "6.8K" },
]

export const topPosts: {
  id: string
  network: NetworkId
  title: string
  date: string
  reach: string
  engagement: string
  clicks: string
  gradient: string
}[] = [
  { id: "t1", network: "instagram", title: "New drop ✦: the autumn edit", date: "Oct 13", reach: "182K", engagement: "9.4%", clicks: "4.1K", gradient: "from-orange-500 to-lime-500" },
  { id: "t2", network: "tiktok", title: "Behind the scenes in the workshop", date: "Oct 9", reach: "146K", engagement: "11.2%", clicks: "2.3K", gradient: "from-cyan-500 to-violet-500" },
  { id: "t3", network: "youtube", title: "Workshop vlog #12", date: "Oct 13", reach: "74K", engagement: "7.8%", clicks: "3.2K", gradient: "from-red-500 to-orange-400" },
  { id: "t4", network: "linkedin", title: "Hiring: Design lead", date: "Oct 12", reach: "38K", engagement: "5.1%", clicks: "1.8K", gradient: "from-sky-600 to-indigo-500" },
]

export const connectedAccounts: {
  network: NetworkId
  handle: string
  followers: string
  status: "connected" | "expiring" | "disconnected"
}[] = [
  { network: "instagram", handle: "@northwind.studio", followers: "22.1k", status: "connected" },
  { network: "tiktok", handle: "@northwind", followers: "14.9k", status: "connected" },
  { network: "youtube", handle: "Northwind Studio", followers: "8.6k", status: "connected" },
  { network: "linkedin", handle: "Northwind Studio", followers: "6.8k", status: "connected" },
  { network: "facebook", handle: "Northwind Studio", followers: "5.4k", status: "connected" },
  { network: "x", handle: "@northwindhq", followers: "4.5k", status: "connected" },
  { network: "threads", handle: "@northwind.studio", followers: "3.1k", status: "connected" },
  { network: "google_business", handle: "Northwind Studio", followers: "1.2k", status: "connected" },
  { network: "pinterest", handle: "Northwind Studio", followers: "9.4k", status: "connected" },
]
