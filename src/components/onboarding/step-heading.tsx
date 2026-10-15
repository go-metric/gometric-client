import type { ReactNode } from "react"
import { Eyebrow } from "@/components/marketing/primitives"

export function StepHeading({
  step,
  title,
  description,
}: {
  step: string
  title: ReactNode
  description: ReactNode
}) {
  return (
    <div className="text-center">
      <Eyebrow>{step}</Eyebrow>
      <h1 className="mt-4 text-4xl leading-[1.08] sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground sm:text-lg">{description}</p>
    </div>
  )
}
