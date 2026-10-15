"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { routes } from "@/config/site"

const items = [
  { href: routes.dashboard.settings, label: "General" },
  { href: routes.dashboard.brands, label: "Brands" },
  { href: routes.dashboard.accounts, label: "Accounts" },
  { href: routes.dashboard.notifications, label: "Notifications" },
  { href: routes.dashboard.billing, label: "Billing" },
]

export function SettingsNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Settings" className="mb-6 flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className="-mb-px shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-brand aria-[current=page]:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
