import type { Metadata } from "next"
import { BillingSettings } from "@/components/dashboard/settings/billing-settings"

export const metadata: Metadata = { title: "Billing" }

export default function BillingSettingsPage() {
  return <BillingSettings />
}
