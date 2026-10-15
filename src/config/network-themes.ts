import type { NetworkId } from "@/config/networks"

/**
 * Visual identity for each network's analytics dashboard. The accent is also
 * the network's colour in combined charts, so it is chosen to stay distinct
 * from every other network (pink, teal, red, green, blue, slate, indigo,
 * purple, orange) rather than copying each brand exactly.
 */
export type NetworkTheme = {
  accent: string
  /** CSS background for the hero banner. */
  gradient: string
  tagline: string
}

export const networkThemes: Record<NetworkId, NetworkTheme> = {
  instagram: {
    accent: "#e1306c",
    gradient: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)",
    tagline: "Reels, stories and the grid, at a glance.",
  },
  tiktok: {
    accent: "#14b8a6",
    gradient: "linear-gradient(135deg, #0b1f24 0%, #0f3d44 55%, #0f766e 100%)",
    tagline: "What's catching on in the For You feed.",
  },
  youtube: {
    accent: "#ef4444",
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #f87171 100%)",
    tagline: "Views, watch time and subscribers.",
  },
  google_business: {
    accent: "#22a559",
    gradient: "linear-gradient(135deg, #14532d 0%, #15803d 55%, #4ade80 100%)",
    tagline: "How local customers find and contact you.",
  },
  facebook: {
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)",
    tagline: "Page reach, reactions and community.",
  },
  x: {
    accent: "#64748b",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #475569 100%)",
    tagline: "Conversation and reach in real time.",
  },
  linkedin: {
    accent: "#6366f1",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #6366f1 100%)",
    tagline: "Your professional audience and what moves it.",
  },
  threads: {
    accent: "#a855f7",
    gradient: "linear-gradient(135deg, #2e1065 0%, #6d28d9 60%, #a855f7 100%)",
    tagline: "Conversations and who joins them.",
  },
  pinterest: {
    accent: "#f97316",
    gradient: "linear-gradient(135deg, #9f1239 0%, #e11d48 55%, #fb923c 100%)",
    tagline: "Saves, clicks and the boards that drive them.",
  },
}
