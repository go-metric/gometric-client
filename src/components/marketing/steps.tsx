"use client"

import { Accordion } from "@base-ui/react/accordion"
import { Plus } from "lucide-react"
import { Accent, Container } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"

const steps = [
  {
    n: "01",
    title: "Connect your accounts",
    body: "Link Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, and Pinterest under each brand in a couple of clicks.",
  },
  {
    n: "02",
    title: "Plan the week in one calendar",
    body: "Drop content on the calendar and schedule across networks at once, with a preview of how each post will look.",
  },
  {
    n: "03",
    title: "Post at the right time",
    body: "Best-time suggestions help each post land when your audience is actually scrolling.",
  },
  {
    n: "04",
    title: "Reply from one inbox",
    body: "Comments and messages land together, so nothing gets buried and every follower gets an answer.",
  },
  {
    n: "05",
    title: "Measure what matters",
    body: "Clear analytics show reach, engagement, and growth, without the noise or the spreadsheets.",
  },
]

export function Steps() {
  return (
    <section className="bg-ink py-24 text-ink-foreground sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-4xl leading-[1.08] font-normal sm:text-5xl lg:text-6xl">
            Everything you need in <Accent>one dashboard</Accent>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-foreground/65">
            Less chaos, more control. gometric brings together everything you need
            to manage social without wasting time.
          </p>
        </Reveal>

        <Accordion.Root defaultValue={["01"]} className="border-t border-ink-foreground/15">
          {steps.map((step) => (
            <Accordion.Item
              key={step.n}
              value={step.n}
              className="border-b border-ink-foreground/15"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full cursor-pointer items-center gap-5 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:gap-8 sm:py-7">
                  <span className="w-9 shrink-0 font-serif text-2xl text-brand italic sm:w-12 sm:text-3xl">
                    {step.n}
                  </span>
                  <span className="flex-1 text-xl font-medium tracking-tight sm:text-2xl">
                    {step.title}
                  </span>
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ink-foreground/20 transition-all group-hover:border-ink-foreground/50 group-data-panel-open:rotate-45 group-data-panel-open:border-brand group-data-panel-open:bg-brand group-data-panel-open:text-white">
                    <Plus className="size-4" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0">
                <p className="max-w-lg pb-7 pl-14 text-base leading-relaxed text-ink-foreground/65 sm:pl-20 sm:text-lg">
                  {step.body}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Container>
    </section>
  )
}
