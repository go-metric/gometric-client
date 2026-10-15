import type { Metadata } from "next"
import { GeneralSettings } from "@/components/dashboard/settings/general-settings"

export const metadata: Metadata = { title: "Settings" }

export default function GeneralSettingsPage() {
  return <GeneralSettings />
}
