"use client"

import type { ComponentProps, ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"
import { useAuthSession } from "@/hooks/use-auth-session"
import { cn } from "@/lib/utils"

type ButtonLinkProps = ComponentProps<typeof ButtonLink>

/** Header Log in / Sign up, or Open dashboard when already signed in. */
export function SiteHeaderAuth({
  layout = "desktop",
  onNavigate,
}: {
  layout?: "desktop" | "mobile"
  onNavigate?: () => void
}) {
  const { status, appHref } = useAuthSession()
  const authed = status === "authenticated"

  if (authed) {
    return (
      <ButtonLink
        variant="ink"
        className={layout === "desktop" ? "px-5 font-semibold" : undefined}
        href={appHref}
        onClick={onNavigate}
      >
        Open dashboard
      </ButtonLink>
    )
  }

  if (layout === "mobile") {
    return (
      <>
        <ButtonLink variant="outline" href={routes.login} onClick={onNavigate}>
          Log in
        </ButtonLink>
        <ButtonLink variant="ink" href={routes.signup} onClick={onNavigate}>
          Sign up free
        </ButtonLink>
      </>
    )
  }

  return (
    <>
      <ButtonLink variant="ghost" href={routes.login}>
        Log in
      </ButtonLink>
      <ButtonLink variant="ink" className="px-5 font-semibold" href={routes.signup}>
        Sign up free
      </ButtonLink>
    </>
  )
}

/**
 * Guest signup CTA that becomes "Open dashboard" (or continue onboarding) when signed in.
 * Renders the guest label while the session is still loading (no token) to avoid layout jump.
 */
export function SignupOrAppButton({
  guestHref = routes.signup,
  authedLabel = "Open dashboard",
  showAuthedArrow = true,
  children,
  className,
  ...props
}: Omit<ButtonLinkProps, "href"> & {
  guestHref?: string
  authedLabel?: string
  showAuthedArrow?: boolean
  children: ReactNode
}) {
  const { status, appHref } = useAuthSession()

  if (status === "authenticated") {
    return (
      <ButtonLink href={appHref} className={className} {...props}>
        {authedLabel}
        {showAuthedArrow ? <ArrowRight data-icon="inline-end" className="text-brand" /> : null}
      </ButtonLink>
    )
  }

  return (
    <ButtonLink href={guestHref} className={cn(className)} {...props}>
      {children}
    </ButtonLink>
  )
}
