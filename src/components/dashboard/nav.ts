import type { LucideIcon } from "lucide-react"
import { BarChart3, CalendarDays, Inbox, LayoutDashboard, PenSquare, Settings } from "lucide-react"
import { routes } from "@/config/site"

export type DashboardNavItem = {
  href: string
  label: string
  Icon: LucideIcon
  /** Shows the live unread count from the inbox. */
  showUnread?: boolean
}

export const dashboardNav: DashboardNavItem[] = [
  { href: routes.dashboard.overview, label: "Overview", Icon: LayoutDashboard },
  { href: routes.dashboard.planner, label: "Planner", Icon: CalendarDays },
  { href: routes.dashboard.compose, label: "Compose", Icon: PenSquare },
  { href: routes.dashboard.inbox, label: "Inbox", Icon: Inbox, showUnread: true },
  { href: routes.dashboard.analytics, label: "Analytics", Icon: BarChart3 },
]

export const dashboardFooterNav: DashboardNavItem[] = [
  { href: routes.dashboard.settings, label: "Settings", Icon: Settings },
]

/** Overview only matches exactly; other sections also match their subpages. */
export function isNavActive(pathname: string, href: string) {
  if (href === routes.dashboard.overview) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
