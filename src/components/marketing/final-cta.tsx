import { ArrowRight } from "lucide-react"
import { SignupOrAppButton } from "@/components/marketing/auth-ctas"
import { FollowersCard, InboxCard } from "@/components/marketing/mocks"
import { Accent, Container, Highlight } from "@/components/marketing/primitives"
import { Reveal } from "@/components/marketing/reveal"

export function FinalCta() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#1f1512] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_120%,color-mix(in_srgb,#ff4d00_55%,transparent),transparent_70%)]"
            />
            <FollowersCard className="absolute top-10 -left-10 hidden -rotate-6 text-foreground opacity-90 xl:block" />
            <InboxCard className="absolute -right-12 bottom-10 hidden rotate-6 text-foreground opacity-90 xl:block" />

            <h2 className="mx-auto max-w-3xl text-4xl leading-[1.08] font-normal sm:text-5xl lg:text-6xl">
              Your social, <Accent>calmer</Accent>, all in{" "}
              <Highlight>one tab</Highlight>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
              Create a free account, connect your networks, and run planning,
              inbox, and analytics from one calm workspace.
            </p>
            <div className="mt-10 flex justify-center">
              <SignupOrAppButton
                size="xl"
                className="bg-white text-[#1f1512] hover:bg-white/90"
              >
                Create your free account
                <ArrowRight data-icon="inline-end" className="text-brand" />
              </SignupOrAppButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
