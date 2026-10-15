import type { Metadata } from "next"
import { OverviewView } from "@/components/dashboard/analytics/analytics-views"

export const metadata: Metadata = { title: "Analytics" }

export default function AnalyticsPage() {
  return <OverviewView />
}
