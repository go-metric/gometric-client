import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type BrandWordmarkProps = {
  className?: string
  href?: string
  size?: "sm" | "md" | "lg" | "hero"
  /** Kept for call-site compatibility; logos already include the icon. */
  showIcon?: boolean
  /** Force the light (white-text) logo, for always-dark surfaces like the footer. */
  inverted?: boolean
}

/**
 * Asset naming in /public/brand:
 * - logo-on-light.png → white “metric” (use on dark backgrounds)
 * - logo-on-dark.png  → dark “metric” (use on light backgrounds)
 */
const LOGO_ON_LIGHT_BG = "/brand/logo-on-dark.png"
const LOGO_ON_DARK_BG = "/brand/logo-on-light.png"

/** Logo asset is 300×79, keep that aspect ratio. */
const logoSizes = {
  sm: { width: 106, height: 28 },
  md: { width: 137, height: 36 },
  lg: { width: 183, height: 48 },
  hero: { width: 243, height: 64 },
} as const

export function BrandWordmark({
  className,
  href = "/",
  size = "md",
  inverted = false,
}: BrandWordmarkProps) {
  const { width, height } = logoSizes[size]
  const priority = size === "hero" || size === "md" || size === "sm"

  const content = inverted ? (
    <Image
      src={LOGO_ON_DARK_BG}
      alt="gometric"
      width={width}
      height={height}
      className={cn("h-auto w-auto", className)}
      priority={priority}
    />
  ) : (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={LOGO_ON_LIGHT_BG}
        alt="gometric"
        width={width}
        height={height}
        className="h-auto w-auto dark:hidden"
        priority={priority}
      />
      <Image
        src={LOGO_ON_DARK_BG}
        alt=""
        aria-hidden
        width={width}
        height={height}
        className="hidden h-auto w-auto dark:block"
        priority={priority}
      />
    </span>
  )

  if (!href) return content

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      aria-label="gometric"
    >
      {content}
    </Link>
  )
}
