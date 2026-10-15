import { ArrowDown, ArrowRight } from "lucide-react"
import {
  AppWindow,
  AutoPublishPill,
  FollowersCard,
  InboxCard,
  PlannerMock,
} from "@/components/marketing/mocks"
import { Accent, Container, Highlight } from "@/components/marketing/primitives"
import { ButtonLink } from "@/components/ui/button"
import { networkList } from "@/config/networks"

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-14 pb-10 sm:pt-20">
      <Container>
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <h1 className="text-[2.25rem] leading-[1.05] font-normal tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[4.25rem]">
            Everything flows better when your{" "}
            <Accent>content, data, and replies</Accent> live in{" "}
            <Highlight>one tab</Highlight>
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Plan, measure, and manage Instagram, TikTok, YouTube, Google
            Business, Facebook, X, LinkedIn, Threads, and Pinterest from one
            tool that saves time and keeps you in control.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <ButtonLink variant="ink" size="xl" href="/signup">
              Create your free account
              <ArrowRight data-icon="inline-end" className="text-brand" />
            </ButtonLink>
            <a
              href="#product"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
            >
              See how it works
              <ArrowDown className="size-4" />
            </a>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">Connects with the networks you already run</p>
            <ul className="flex items-center gap-4">
              {networkList.map(({ id, name, Icon, iconColor }) => (
                <li key={id} title={name}>
                  <Icon className={`size-5 ${iconColor}`} />
                  <span className="sr-only">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl sm:mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-20 -top-16 bottom-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,color-mix(in_srgb,var(--brand)_22%,transparent),transparent_70%)]"
          />
          <AppWindow active="planner" className="lg:mx-16">
            <PlannerMock />
          </AppWindow>
          <FollowersCard className="absolute top-24 -left-2 hidden -rotate-2 lg:block" />
          <InboxCard className="absolute -top-8 -right-2 hidden rotate-2 lg:block" />
          <AutoPublishPill className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:left-28 lg:translate-x-0" />
        </div>
      </Container>
    </section>
  )
}
