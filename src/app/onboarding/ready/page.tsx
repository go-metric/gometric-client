import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, PartyPopper } from "lucide-react"
import { Accent } from "@/components/marketing/primitives"
import { StepHeading } from "@/components/onboarding/step-heading"
import { ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "You're all set" }

const nextSteps = [
  { href: routes.dashboard.compose, title: "Write your first post", body: "Draft once and tailor it per network.", tint: "bg-tint-lime" },
  { href: routes.dashboard.planner, title: "Plan the week", body: "Drop posts onto the calendar.", tint: "bg-tint-peach" },
  { href: routes.dashboard.inbox, title: "Open your inbox", body: "Reply to comments and DMs.", tint: "bg-tint-lilac" },
]

export default function ReadyPage() {
  return (
    <>
      <div className="mb-8 flex justify-center">
        <span className="inline-flex size-16 items-center justify-center rounded-3xl bg-highlight text-[#1f1512]">
          <PartyPopper className="size-7" />
        </span>
      </div>
      <StepHeading
        step="Step 3 of 3"
        title={
          <>
            You&apos;re <Accent>all set</Accent>
          </>
        }
        description="Your brand workspace is ready. Here are a few good places to start."
      />
      <ul className="mt-10 grid gap-3 sm:grid-cols-3">
        {nextSteps.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className={`group flex h-full flex-col rounded-3xl p-5 transition-transform hover:-translate-y-0.5 ${s.tint}`}
            >
              <span className="font-semibold">{s.title}</span>
              <span className="mt-1 flex-1 text-sm text-foreground/70">{s.body}</span>
              <ArrowRight className="mt-5 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <ButtonLink variant="ink" size="xl" href={routes.dashboard.overview}>
          Go to dashboard
          <ArrowRight data-icon="inline-end" className="text-brand" />
        </ButtonLink>
      </div>
    </>
  )
}
