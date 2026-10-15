import type { ComponentType, SVGProps } from "react"
import {
  FacebookIcon,
  GoogleBusinessIcon,
  InstagramIcon,
  LinkedInIcon,
  PinterestIcon,
  ThreadsIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons/network-icons"

export type NetworkId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "google_business"
  | "facebook"
  | "x"
  | "linkedin"
  | "threads"
  | "pinterest"

export type Network = {
  id: NetworkId
  name: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Accent used for chart series, borders, and progress bars. */
  color: string
  /** Logo-tile background (class names). */
  tile: string
  /** Brand-coloured icon on neutral surfaces (class names). */
  iconColor: string
  accountLabel: string
  /** Max caption length accepted by the network. */
  charLimit: number
}

export const networks: Record<NetworkId, Network> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    Icon: InstagramIcon,
    color: "#e1306c",
    tile: "bg-[linear-gradient(135deg,#f58529_0%,#dd2a7b_45%,#8134af_75%,#515bd4_100%)]",
    iconColor: "text-[#e1306c]",
    accountLabel: "Business or creator account",
    charLimit: 2200,
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    Icon: TikTokIcon,
    color: "#00b8bd",
    tile: "bg-neutral-950",
    iconColor: "text-foreground",
    accountLabel: "TikTok account",
    charLimit: 2200,
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    Icon: YouTubeIcon,
    color: "#ff0000",
    tile: "bg-[#ff0000]",
    iconColor: "text-[#ff0000]",
    accountLabel: "YouTube channel",
    charLimit: 5000,
  },
  google_business: {
    id: "google_business",
    name: "Google Business",
    Icon: GoogleBusinessIcon,
    color: "#4285f4",
    tile: "bg-[#4285f4]",
    iconColor: "text-[#4285f4]",
    accountLabel: "Google Business Profile",
    charLimit: 1500,
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    Icon: FacebookIcon,
    color: "#1877f2",
    tile: "bg-[#1877f2]",
    iconColor: "text-[#1877f2]",
    accountLabel: "Facebook Page",
    charLimit: 63206,
  },
  x: {
    id: "x",
    name: "X",
    Icon: XIcon,
    color: "#52525b",
    tile: "bg-neutral-950",
    iconColor: "text-foreground",
    accountLabel: "X profile",
    charLimit: 280,
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    Icon: LinkedInIcon,
    color: "#0a66c2",
    tile: "bg-[#0a66c2]",
    iconColor: "text-[#0a66c2]",
    accountLabel: "Company page or profile",
    charLimit: 3000,
  },
  threads: {
    id: "threads",
    name: "Threads",
    Icon: ThreadsIcon,
    color: "#71717a",
    tile: "bg-neutral-950",
    iconColor: "text-foreground",
    accountLabel: "Threads profile",
    charLimit: 500,
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    Icon: PinterestIcon,
    color: "#e60023",
    tile: "bg-[#e60023]",
    iconColor: "text-[#e60023]",
    accountLabel: "Pinterest business account",
    charLimit: 500,
  },
}

export const networkList = Object.values(networks)

export function isNetworkId(value: string | null | undefined): value is NetworkId {
  return !!value && Object.hasOwn(networks, value)
}
