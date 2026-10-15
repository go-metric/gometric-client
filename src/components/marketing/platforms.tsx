import { ArrowUpRight, Check, Link2 } from "lucide-react"
import { NetworkTile } from "@/components/network"
import { Accent, Container, Eyebrow } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"
import { networkList } from "@/config/networks"

const points = [
  "Secure sign-in with each network (OAuth)",
  "Each brand gets its own connected profiles",
  "Schedule, inbox, and analytics right after you link",
]

export function Platforms() {
  return (
    <section id="platforms" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-12 rounded-[2rem] border border-foreground/80 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:p-14">
          <Reveal>
            <Eyebrow className="inline-flex items-center gap-2">
              <Link2 className="size-3.5 text-brand" />
              Connect your accounts
            </Eyebrow>
            <h2 className="mt-4 text-4xl leading-[1.1] font-normal sm:text-5xl">
              Your networks. <Accent>Linked once.</Accent> Managed together.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-muted-foreground sm:text-lg">
              gometric works by connecting the social accounts you already run,
              so you can plan, reply, and measure without hopping between apps.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-foreground/80 sm:text-base">
              {points.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-highlight text-[#1f1512]">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_55%)] sm:-inset-6"
            />
            <ul className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
              {networkList.map((network) => (
                <li
                  key={network.id}
                  className="group flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md hover:shadow-brand/5"
                >
                  <NetworkTile network={network.id} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-tight">{network.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{network.accountLabel}</p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/80 transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    Connect
                    <ArrowUpRight className="size-3 opacity-70" />
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
