import type { Metadata } from "next"
import { RequireAuth } from "@/components/auth/require-auth"
import { AppShell } from "@/components/dashboard/app-shell"

export const metadata: Metadata = {
  robots: { index: false },
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <RequireAuth mode="dashboard">
      <AppShell>{children}</AppShell>
    </RequireAuth>
  )
}
