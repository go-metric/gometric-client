import { ArrowLeft } from "lucide-react"
import { BrandWordmark } from "@/components/brand-wordmark"
import { Accent } from "@/components/marketing/primitives"
import { ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <BrandWordmark size="sm" showIcon />
      <p className="mt-14 font-serif text-[7rem] leading-none italic text-brand sm:text-[10rem]">404</p>
      <h1 className="mt-6 text-3xl sm:text-5xl">
        This page took a <Accent>day off</Accent>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The link may be broken, or the page may have moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <ButtonLink variant="ink" size="lg" href={routes.home}>
          <ArrowLeft data-icon="inline-start" />
          Back to home
        </ButtonLink>
        <ButtonLink variant="outline" size="lg" href="/contact">
          Contact us
        </ButtonLink>
      </div>
    </main>
  )
}
