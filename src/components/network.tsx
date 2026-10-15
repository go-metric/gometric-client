import { networks, type NetworkId } from "@/config/networks"
import { cn } from "@/lib/utils"

/** Small round logo badge, e.g. overlaid on an avatar. */
export function NetworkBadge({
  network,
  className,
}: {
  network: NetworkId
  className?: string
}) {
  const { Icon, tile, name } = networks[network]
  return (
    <span
      title={name}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full ring-2 ring-card",
        tile,
        className
      )}
    >
      <Icon className="size-2.5 text-white" />
    </span>
  )
}

const tileSizes = {
  sm: "size-8 rounded-lg [&_svg]:size-4",
  md: "size-10 rounded-xl [&_svg]:size-5",
  lg: "size-12 rounded-2xl [&_svg]:size-[1.35rem]",
}

/** Square logo tile in the network's brand colours. */
export function NetworkTile({
  network,
  size = "md",
  className,
}: {
  network: NetworkId
  size?: keyof typeof tileSizes
  className?: string
}) {
  const { Icon, tile } = networks[network]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-white ring-1 ring-black/5 dark:ring-white/10",
        tile,
        tileSizes[size],
        className
      )}
    >
      <Icon />
    </span>
  )
}

/** Initials avatar with an optional network badge. */
export function PersonAvatar({
  initials,
  color,
  network,
  size = "md",
}: {
  initials: string
  color: string
  network?: NetworkId
  size?: "sm" | "md"
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold text-white",
          size === "md" ? "size-9 text-xs" : "size-8 text-[11px]"
        )}
        style={{ background: color }}
      >
        {initials}
      </span>
      {network ? (
        <NetworkBadge network={network} className="absolute -right-1 -bottom-1" />
      ) : null}
    </span>
  )
}
