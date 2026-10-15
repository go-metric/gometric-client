import type { Metadata } from "next"
import { BrandsSettings } from "@/components/dashboard/settings/brands-settings"

export const metadata: Metadata = { title: "Brands" }

export default function BrandsSettingsPage() {
  return <BrandsSettings />
}
