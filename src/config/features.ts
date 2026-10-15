import type { LucideIcon } from "lucide-react"
import { BarChart3, CalendarDays, Inbox, PenSquare } from "lucide-react"

export type FeatureId = "planner" | "inbox" | "analytics" | "compose"

export type Feature = {
  id: FeatureId
  href: `/features/${FeatureId}`
  label: string
  Icon: LucideIcon
  eyebrow: string
  title: string
  /** Headline split so the middle part renders as a serif accent. */
  headline: [string, string, string]
  summary: string
  body: string
  tint: string
  cta: string
  highlights: { title: string; body: string }[]
  steps: { title: string; body: string }[]
}

export const features: Record<FeatureId, Feature> = {
  planner: {
    id: "planner",
    href: "/features/planner",
    label: "Planner",
    Icon: CalendarDays,
    eyebrow: "3-in-1",
    title: "Planner, queue, and calendar",
    headline: ["Plan the whole week in ", "one calendar", ""],
    summary: "Drag-and-drop scheduling across every network you connect.",
    body: "Drag and drop content into the calendar, find the best times to post, and schedule across every network you connect. Preview each post before it goes live.",
    tint: "bg-tint-peach",
    cta: "Explore the Planner",
    highlights: [
      { title: "Drag-and-drop calendar", body: "Move posts between days and time slots without opening an editor." },
      { title: "Best times to post", body: "Suggested slots based on when your audience is most active." },
      { title: "Per-network previews", body: "See exactly how each post will look before it's published." },
      { title: "Drafts and queues", body: "Keep ideas in drafts and fill empty slots from a queue." },
    ],
    steps: [
      { title: "Create or import", body: "Write a post or pull one from your drafts." },
      { title: "Drop it on the calendar", body: "Pick a day and time — or take the suggested slot." },
      { title: "Publish automatically", body: "gometric posts it for you on every selected network." },
    ],
  },
  inbox: {
    id: "inbox",
    href: "/features/inbox",
    label: "Inbox",
    Icon: Inbox,
    eyebrow: "Reply",
    title: "An inbox that lets you breathe",
    headline: ["Every comment and DM, ", "one calm inbox", ""],
    summary: "Comments and messages from every account, in one place.",
    body: "Comments and DMs from your connected accounts, neatly in one place. Reply with saved responses and never miss an important conversation.",
    tint: "bg-tint-lilac",
    cta: "Explore the Inbox",
    highlights: [
      { title: "Unified conversations", body: "Comments and DMs from every network in a single list." },
      { title: "Saved replies", body: "Answer common questions in one click with reusable responses." },
      { title: "Filters that matter", body: "Split by network, comments, DMs, or unread in a tap." },
      { title: "Never miss a mention", body: "Unread badges and notifications keep nothing buried." },
    ],
    steps: [
      { title: "Messages land together", body: "Every comment and DM arrives in the same inbox." },
      { title: "Reply in context", body: "See the original post right next to the conversation." },
      { title: "Mark it done", body: "Clear conversations as you go and keep inbox zero." },
    ],
  },
  analytics: {
    id: "analytics",
    href: "/features/analytics",
    label: "Analytics",
    Icon: BarChart3,
    eyebrow: "Measure",
    title: "Analytics without the headache",
    headline: ["The numbers that matter, ", "without the noise", ""],
    summary: "Clear reach, engagement, and growth across networks.",
    body: "Turn data into decisions. See how each channel performs, track progress over time, and spot what actually moves the needle.",
    tint: "bg-tint-sky",
    cta: "Explore Analytics",
    highlights: [
      { title: "Cross-network overview", body: "Followers, reach, and engagement for every account at a glance." },
      { title: "Top posts", body: "Find the content that performs best and make more of it." },
      { title: "Growth over time", body: "Weekly and monthly trends without spreadsheet work." },
      { title: "Shareable reports", body: "Export a clean summary for your team or clients." },
    ],
    steps: [
      { title: "Connect once", body: "Analytics start flowing as soon as an account is linked." },
      { title: "Compare channels", body: "See which networks drive reach and which drive clicks." },
      { title: "Act on it", body: "Feed what works straight back into the planner." },
    ],
  },
  compose: {
    id: "compose",
    href: "/features/compose",
    label: "Compose",
    Icon: PenSquare,
    eyebrow: "Create",
    title: "Write once, tailor everywhere",
    headline: ["Write once, ", "tailor everywhere", ""],
    summary: "One composer for every network, with live previews.",
    body: "Draft a post, pick the networks, adjust copy per platform, and schedule it for the best time — all from a single composer.",
    tint: "bg-tint-lime",
    cta: "Explore Compose",
    highlights: [
      { title: "Multi-network posting", body: "Select any connected networks and publish in one step." },
      { title: "Per-network copy", body: "Tweak captions, hashtags, and links for each platform." },
      { title: "Live previews", body: "See the post as your followers will see it." },
      { title: "Media library", body: "Keep images and videos ready to reuse across posts." },
    ],
    steps: [
      { title: "Write the post", body: "Start with one caption and your media." },
      { title: "Pick the networks", body: "Choose where it goes and adjust copy per network." },
      { title: "Schedule or publish", body: "Send it now or drop it in the best time slot." },
    ],
  },
}

export const featureList = Object.values(features)
