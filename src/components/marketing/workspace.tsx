import type { ReactNode } from "react"
import { CalendarCheck2, MessageCircleHeart } from "lucide-react"
import { FeatureWindow } from "@/components/marketing/mocks"
import { Accent, Container, Highlight } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"
import type { FeatureId } from "@/config/features"
import { cn } from "@/lib/utils"

const cards: {
  title: string
  body: ReactNode
  tint: string
  feature: FeatureId
}[] = [
  {
    title: "Plan smarter",
    body: (
      <>
        <strong className="font-semibold text-foreground">Drag and drop content onto the calendar</strong>,
        preview how it looks on each network, and{" "}
        <strong className="font-semibold text-foreground">reach more people without the stress</strong>.
      </>
    ),
    tint: "bg-tint-peach",
    feature: "planner",
  },
  {
    title: "Automate the busywork",
    body: (
      <>
        <strong className="font-semibold text-foreground">Draft once and tailor per network</strong>,
        reuse saved replies, and let best-time suggestions pick the slot —
        so you spend time on the creative work, not the clicking.
      </>
    ),
    tint: "bg-tint-lime",
    feature: "compose",
  },
  {
    title: "Analyze with clear data",
    body: (
      <>
        <strong className="font-semibold text-foreground">The metrics that matter stay in front of you</strong>.
        No digging, no guessing, no spreadsheet archaeology.
      </>
    ),
    tint: "bg-tint-sky",
    feature: "analytics",
  },
]

function DashedWave() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 360"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-2 -z-10 h-44 w-full sm:h-56"
    >
      <path
        d="M-40 60 C 240 360, 520 340, 760 230 S 1240 40, 1480 230"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="34"
        strokeDasharray="7 17"
      />
    </svg>
  )
}

export function Workspace() {
  return (
    <section id="product" className="scroll-mt-24">
      <div className="relative isolate overflow-hidden pt-24 pb-44 sm:pt-32 sm:pb-56">
        <DashedWave />
        <Container className="relative">
          <div
            aria-hidden
            className="absolute -top-6 left-8 hidden size-32 -rotate-6 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#ff4d00,#ff9a5c)] text-white shadow-xl xl:flex"
          >
            <CalendarCheck2 className="size-14" strokeWidth={1.5} />
          </div>
          <div
            aria-hidden
            className="absolute right-12 -bottom-10 hidden size-28 rotate-6 items-center justify-center rounded-3xl bg-highlight text-[#1f1512] shadow-xl xl:flex"
          >
            <MessageCircleHeart className="size-12" strokeWidth={1.5} />
          </div>
          <Reveal>
            <h2 className="mx-auto max-w-4xl text-center text-4xl leading-[1.1] font-normal sm:text-5xl lg:text-6xl">
              Every week, <Accent>social media managers</Accent>{" "}
              <Highlight>get</Highlight> hours of their life back
            </h2>
          </Reveal>
        </Container>
      </div>

      <Container className="pb-24 sm:pb-32">
        <Reveal>
          <h2 className="mx-auto max-w-4xl text-center text-4xl leading-[1.1] font-normal sm:text-5xl lg:text-6xl">
            Trade endless tabs for one clean workspace
          </h2>
        </Reveal>

        <div className="mt-14 space-y-6 sm:mt-16">
          {cards.map((card, i) => (
            <article
              key={card.title}
              className={cn(
                "sticky overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-12",
                card.tint
              )}
              style={{ top: `calc(5.5rem + ${i * 1.5}rem)` }}
            >
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
                <div>
                  <h3 className="text-3xl font-normal sm:text-4xl">{card.title}</h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75 sm:text-lg">
                    {card.body}
                  </p>
                </div>
                <FeatureWindow id={card.feature} />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
