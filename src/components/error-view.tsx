"use client"

import { ArrowLeft, RotateCw } from "lucide-react"
import { BrandWordmark } from "@/components/brand-wordmark"
import { Accent } from "@/components/marketing/primitives"
import { Button, ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"

type ErrorViewProps = {
  onRetry: () => void
  /** Optional digest from Next.js for support / log matching. */
  digest?: string
}

export function ErrorView({ onRetry, digest }: ErrorViewProps) {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <BrandWordmark size="sm" showIcon />
      <p className="mt-14 font-serif text-[7rem] leading-none italic text-brand sm:text-[10rem]">500</p>
      <h1 className="mt-6 text-3xl sm:text-5xl">
        This page hit a <Accent>snag</Accent>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Something went wrong on our side. Try again, or head home and pick up where you left off.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button variant="ink" size="lg" onClick={onRetry}>
          <RotateCw data-icon="inline-start" />
          Try again
        </Button>
        <ButtonLink variant="outline" size="lg" href={routes.home}>
          <ArrowLeft data-icon="inline-start" />
          Back to home
        </ButtonLink>
      </div>
      {digest ? (
        <p className="mt-8 font-mono text-[11px] text-muted-foreground/70">Ref: {digest}</p>
      ) : null}
    </main>
  )
}
