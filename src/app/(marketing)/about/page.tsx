import type { Metadata } from "next"
import { Compass, Feather, Lock, Sparkles } from "lucide-react"
import { FinalCta } from "@/components/marketing/final-cta"
import { Accent, Container, Eyebrow, Highlight, PageHero } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"

export const metadata: Metadata = {
  title: "About",
  description: "Why we're building gometric: a calmer way to run social for one brand.",
}

const values = [
  {
    Icon: Feather,
    title: "Calm by default",
    body: "Fewer tabs, fewer alerts, fewer decisions. Every screen should leave you lighter than it found you.",
    tint: "bg-tint-peach",
  },
  {
    Icon: Compass,
    title: "Focused on one brand",
    body: "No agency sprawl. One workspace, one calendar, one inbox, built around the brand you actually run.",
    tint: "bg-tint-lime",
  },
  {
    Icon: Lock,
    title: "Your accounts, your keys",
    body: "We connect through each network's official sign-in. You can disconnect any account at any time.",
    tint: "bg-tint-sky",
  },
  {
    Icon: Sparkles,
    title: "Craft over features",
    body: "We'd rather ship four tools that feel great than forty that feel like work.",
    tint: "bg-tint-lilac",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About gometric"
        title={
          <>
            Social media, <Accent>minus</Accent> the chaos
          </>
        }
        description="We're building the tool we wanted for ourselves: one quiet place to plan posts, answer people, and see what's working."
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-10 rounded-[2rem] border border-foreground/80 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16 lg:p-14">
            <Reveal>
              <Eyebrow>Our story</Eyebrow>
              <p className="mt-5 text-2xl leading-snug font-normal text-balance sm:text-3xl lg:text-4xl">
                Running a brand&apos;s social shouldn&apos;t mean living in{" "}
                <Highlight>six different apps</Highlight>. So we put the
                calendar, the inbox, and the numbers <Accent>side by side</Accent>.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Most social tools are built for agencies juggling dozens of
                clients. That power comes with noise: permissions, workspaces,
                and settings you&apos;ll never touch.
              </p>
              <p>
                gometric is deliberately smaller. You create one brand, connect
                the networks it lives on, and get straight to the work: planning,
                replying, and learning from what you post.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <h2 className="max-w-2xl text-4xl leading-[1.08] sm:text-5xl">
            What we <Accent>care about</Accent>
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <li className={`flex h-full flex-col rounded-3xl p-6 sm:p-10 ${v.tint}`}>
                  <v.Icon className="size-7" />
                  <h3 className="mt-10 text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-foreground/70 sm:text-lg">{v.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta />
    </>
  )
}
