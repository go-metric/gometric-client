import { SettingsNav } from "@/components/dashboard/settings/settings-nav"
import { PageHeader } from "@/components/dashboard/ui"

export default function SettingsLayout({ children }: LayoutProps<"/dashboard/settings">) {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" description="Your profile, brands, accounts, notifications, and plan." />
      <SettingsNav />
      {children}
    </div>
  )
}
