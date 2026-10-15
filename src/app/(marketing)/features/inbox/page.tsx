import type { Metadata } from "next"
import { FeatureDetail } from "@/components/marketing/feature-detail"
import { features } from "@/config/features"

export const metadata: Metadata = {
  title: features.inbox.label,
  description: features.inbox.summary,
}

export default function InboxFeaturePage() {
  return <FeatureDetail id="inbox" />
}
