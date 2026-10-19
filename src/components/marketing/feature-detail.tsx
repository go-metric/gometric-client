import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { SignupOrAppButton } from "@/components/marketing/auth-ctas"
import { FinalCta } from "@/components/marketing/final-cta"
import { FeatureWindow } from "@/components/marketing/mocks"
import { Accent, Container, Eyebrow, PageHero, SectionHeader } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"
import { ButtonLink } from "@/components/ui/button"
import { featureList, features, type FeatureId } from "@/config/features"
import { cn } from "@/lib/utils"

export function FeatureHeadline({ id }: { id: FeatureId }) {
  const [before, accent, after] = features[id].headline
  return (
    <>
      {before}
      <Accent>{accent}</Accent>
      {after}
    </>
  )
}

export function FeatureDetail({ id }: { id: FeatureId }) {
  const feature = features[id]
  const others = featureList.filter((f) => f.id !== id)

  return (
    <>
      <PageHero
        eyebrow={`${feature.label} · ${feature.eyebrow}`}
        title={<FeatureHeadline id={id} />}
        description={feature.body}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SignupOrAppButton variant="ink" size="xl">
            Sign up free
            <ArrowRight data-icon="inline-end" className="text-brand" />
          </SignupOrAppButton>
          <ButtonLink variant="ghost" size="lg" href="/pricing">
            See pricing
          </ButtonLink>
        </div>
      </PageHero>

      <Container>
        <div className={cn("rounded-[2rem] p-3 sm:p-8 lg:p-12", feature.tint)}>
          <FeatureWindow id={id} className="mx-auto max-w-5xl" />
        </div>
      </Container>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader
            align="left"
            eyebrow="What you get"
            title={feature.title}
            description={feature.summary}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {feature.highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.05}>
                <li className="flex h-full gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-highlight text-[#1f1512]">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold sm:text-xl">{h.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{h.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="rounded-[2rem] bg-ink p-6 text-ink-foreground sm:p-10 lg:p-14">
            <Eyebrow className="text-ink-foreground/60">How it works</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-3xl font-normal sm:text-5xl">
              Three steps, <Accent>no detours</Accent>
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {feature.steps.map((step, i) => (
                <li key={step.title} className="border-t border-ink-foreground/20 pt-6">
                  <span className="font-serif text-4xl italic text-brand">0{i + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-foreground/70">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <h2 className="text-3xl sm:text-4xl">
            Explore <Accent>more features</Accent>
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {others.map((f) => (
              <li key={f.id}>
                <Link
                  href={f.href}
                  className={cn(
                    "group flex h-full flex-col rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1 sm:p-8",
                    f.tint
                  )}
                >
                  <f.Icon className="size-6" />
                  <h3 className="mt-6 text-xl font-semibold">{f.label}</h3>
                  <p className="mt-2 flex-1 text-foreground/70">{f.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {f.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta />
    </>
  )
}
