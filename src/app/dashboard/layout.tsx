import type { Metadata } from "next"
import { AppShell } from "@/components/dashboard/app-shell"

export const metadata: Metadata = {
  robots: { index: false },
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <AppShell>{children}</AppShell>
}
