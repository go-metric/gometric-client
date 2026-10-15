import type { Metadata } from "next"
import { AccountsSettings } from "@/components/dashboard/settings/accounts-settings"

export const metadata: Metadata = { title: "Connected accounts" }

export default function ConnectedAccountsPage() {
  return <AccountsSettings />
}
