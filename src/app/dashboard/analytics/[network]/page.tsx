import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { NetworkView } from "@/components/dashboard/analytics/analytics-views"
import { isNetworkId, networkList, networks } from "@/config/networks"

export function generateStaticParams() {
  return networkList.map((n) => ({ network: n.id }))
}

export async function generateMetadata({ params }: PageProps<"/dashboard/analytics/[network]">): Promise<Metadata> {
  const { network } = await params
  return { title: isNetworkId(network) ? `${networks[network].name} analytics` : "Analytics" }
}

export default async function NetworkAnalyticsPage({ params }: PageProps<"/dashboard/analytics/[network]">) {
  const { network } = await params
  if (!isNetworkId(network)) notFound()
  return <NetworkView network={network} />
}
