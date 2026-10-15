"use client"

import { Tabs } from "@base-ui/react/tabs"
import { ArrowRight } from "lucide-react"
import { FeatureWindow } from "@/components/marketing/mocks"
import { Accent, Container, Eyebrow, SectionHeader } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"
import { ButtonLink } from "@/components/ui/button"
import { featureList } from "@/config/features"

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 pt-8 pb-24 sm:pt-12 sm:pb-32">
      <Container>
        <Reveal>
          <SectionHeader
            align="left"
            className="max-w-4xl"
            title={
              <>
                A management tool as <Accent>focused</Accent> as you are
              </>
            }
            description={
              <>
                Behind every social account there&apos;s a person working their
                magic around the clock. We built a dashboard with the features you
                need to{" "}
                <strong className="font-semibold text-foreground">
                  make the job easier without the hassle
                </strong>
                .
              </>
            }
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <Tabs.Root
            defaultValue={featureList[0].id}
            className="rounded-[2rem] bg-tint-lilac p-4 sm:p-8 lg:p-10"
          >
            <Tabs.List className="relative z-0 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-foreground/5 p-1 [scrollbar-width:none]">
              {featureList.map((f) => (
                <Tabs.Tab
                  key={f.id}
                  value={f.id}
                  className="relative z-10 shrink-0 cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium text-foreground/65 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-active:text-foreground sm:px-6 sm:text-base"
                >
                  {f.label}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator className="absolute top-1/2 left-0 -z-10 h-[calc(100%-0.5rem)] w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-full bg-card shadow-sm transition-all duration-300 ease-out" />
            </Tabs.List>

            {featureList.map((f) => (
              <Tabs.Panel
                key={f.id}
                value={f.id}
                className="mt-8 grid items-center gap-8 outline-none lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-12"
              >
                <div>
                  <Eyebrow>{f.eyebrow}</Eyebrow>
                  <h3 className="mt-3 text-3xl font-normal sm:text-4xl">{f.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-foreground/75 sm:text-lg">
                    {f.body}
                  </p>
                  <ButtonLink variant="ink" size="lg" className="mt-7 rounded-2xl" href={f.href}>
                    {f.cta}
                    <ArrowRight data-icon="inline-end" className="text-brand" />
                  </ButtonLink>
                </div>
                <div>
                  <FeatureWindow id={f.id} />
                </div>
              </Tabs.Panel>
            ))}
          </Tabs.Root>
        </Reveal>
      </Container>
    </section>
  )
}
