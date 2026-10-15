import type { Metadata } from "next"
import { FeatureDetail } from "@/components/marketing/feature-detail"
import { features } from "@/config/features"

export const metadata: Metadata = {
  title: features.planner.label,
  description: features.planner.summary,
}

export default function PlannerFeaturePage() {
  return <FeatureDetail id="planner" />
}
