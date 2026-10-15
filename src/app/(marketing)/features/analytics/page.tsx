import type { Metadata } from "next"
import { FeatureDetail } from "@/components/marketing/feature-detail"
import { features } from "@/config/features"

export const metadata: Metadata = {
  title: features.analytics.label,
  description: features.analytics.summary,
}

export default function AnalyticsFeaturePage() {
  return <FeatureDetail id="analytics" />
}
