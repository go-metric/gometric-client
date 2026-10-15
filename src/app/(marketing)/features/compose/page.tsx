import type { Metadata } from "next"
import { FeatureDetail } from "@/components/marketing/feature-detail"
import { features } from "@/config/features"

export const metadata: Metadata = {
  title: features.compose.label,
  description: features.compose.summary,
}

export default function ComposeFeaturePage() {
  return <FeatureDetail id="compose" />
}
