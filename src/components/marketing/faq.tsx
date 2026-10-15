"use client"

import { Accordion } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { Container, SectionHeader } from "@/components/marketing/primitives"
import { cn } from "@/lib/utils"
import { generalFaqs, type FaqItem } from "@/config/faq"

type FaqProps = {
  items?: FaqItem[]
  title?: string
  className?: string
}

export function Faq({
  items = generalFaqs,
  title = "Good questions, quick answers",
  className,
}: FaqProps) {
  return (
    <section id="faq" className={cn("scroll-mt-24 pb-24 sm:pb-32", className)}>
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <SectionHeader
          align="left"
          eyebrow="Frequently asked questions"
          title={title}
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <Accordion.Root className="space-y-3">
          {items.map((item) => (
            <Accordion.Item
              key={item.q}
              value={item.q}
              className="rounded-2xl border border-border bg-card transition-colors data-open:border-foreground/40"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-2xl sm:px-6 sm:text-lg">
                  <span className="flex-1">{item.q}</span>
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-panel-open:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0">
                <p className="px-5 pb-6 leading-relaxed text-muted-foreground sm:px-6">
                  {item.a}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Container>
    </section>
  )
}
