import Link from "next/link"
import { BrandWordmark } from "@/components/brand-wordmark"
import { CurrentYear } from "@/components/current-year"
import { Container } from "@/components/marketing/primitives"
import { footerNav, siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="bg-[#1f1512] text-white">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 sm:py-20 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandWordmark size="md" showIcon inverted />
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/60">
            Social management for every brand: plan, inbox, and analytics
            after you connect your accounts.
          </p>
        </div>
        {footerNav.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold tracking-wide">{group.title}</p>
            <ul className="mt-5 space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© <CurrentYear /> {siteConfig.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-white">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-white">
              {siteConfig.supportEmail}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  )
}
