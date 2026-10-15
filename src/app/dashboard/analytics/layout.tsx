import { AnalyticsShell } from "@/components/dashboard/analytics/analytics-shell"

export default function AnalyticsLayout({ children }: LayoutProps<"/dashboard/analytics">) {
  return <AnalyticsShell>{children}</AnalyticsShell>
}
