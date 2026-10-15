import type { Metadata } from "next"
import { NotificationSettings } from "@/components/dashboard/settings/notification-settings"

export const metadata: Metadata = { title: "Notifications" }

export default function NotificationSettingsPage() {
  return <NotificationSettings />
}
