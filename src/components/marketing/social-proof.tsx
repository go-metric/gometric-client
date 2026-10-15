import { Accent, Container, Eyebrow } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

const quotes = [
  {
    text: "Finally — plan, replies, and metrics without living in seven tabs.",
    name: "Early tester",
    role: "Social media manager",
    initials: "ET",
    tint: "bg-tint-peach",
  },
  {
    text: "Connecting accounts once and scheduling from one calendar is the whole job, simplified.",
    name: "Brand lead",
    role: "Single-brand team",
    initials: "BL",
    tint: "bg-tint-lime",
  },
]

export function SocialProof() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Built for social media managers</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.1] font-normal sm:text-5xl lg:text-6xl">
            Made for the people <Accent>behind the posts</Accent>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {quotes.map((quote, i) => (
            <Reveal key={quote.text} delay={i * 0.08}>
              <figure
                className={cn(
                  "flex h-full flex-col justify-between rounded-[2rem] p-8 sm:p-10",
                  quote.tint
                )}
              >
                <blockquote className="text-2xl leading-snug font-normal tracking-tight sm:text-[1.75rem]">
                  “{quote.text}”
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-ink-foreground">
                    {quote.initials}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{quote.name}</span>
                    <span className="text-foreground/65">{quote.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
