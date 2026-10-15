import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { FeatureHeadline } from "@/components/marketing/feature-detail"
import { FinalCta } from "@/components/marketing/final-cta"
import { FeatureWindow } from "@/components/marketing/mocks"
import { Platforms } from "@/components/marketing/platforms"
import { Accent, Container, Eyebrow, PageHero } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"
import { ButtonLink } from "@/components/ui/button"
import { featureList } from "@/config/features"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Features",
  description: "Planner, inbox, analytics, and compose — everything you need to run social for one brand.",
}

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Four tools. <Accent>One calm</Accent> workspace.
          </>
        }
        description="Plan the week, answer every message, measure what works, and write once for every network — without juggling tabs."
      >
        <nav aria-label="Features" className="flex flex-wrap justify-center gap-2">
          {featureList.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/40"
            >
              <f.Icon className="size-4 text-brand" />
              {f.label}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="space-y-6 pb-8 sm:space-y-8">
        {featureList.map((f, i) => (
          <section key={f.id} id={f.id} className="scroll-mt-24">
            <Container>
              <Reveal>
                <div
                  className={cn(
                    "grid items-center gap-8 rounded-[2rem] p-5 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12",
                    f.tint
                  )}
                >
                  <div className={cn(i % 2 === 1 && "lg:order-2")}>
                    <Eyebrow className="inline-flex items-center gap-2">
                      <f.Icon className="size-4" />
                      {f.label}
                    </Eyebrow>
                    <h2 className="mt-4 text-3xl leading-[1.1] font-normal sm:text-5xl">
                      <FeatureHeadline id={f.id} />
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-foreground/75 sm:text-lg">
                      {f.body}
                    </p>
                    <ul className="mt-6 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
                      {f.highlights.map((h) => (
                        <li key={h.title} className="flex items-center gap-2">
                          <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                          {h.title}
                        </li>
                      ))}
                    </ul>
                    <ButtonLink variant="ink" size="lg" className="mt-8 rounded-2xl" href={f.href}>
                      {f.cta}
                      <ArrowRight data-icon="inline-end" className="text-brand" />
                    </ButtonLink>
                  </div>
                  <FeatureWindow id={f.id} />
                </div>
              </Reveal>
            </Container>
          </section>
        ))}
      </div>

      <Platforms />
      <FinalCta />
    </>
  )
}
