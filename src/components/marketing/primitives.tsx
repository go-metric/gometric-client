import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Container({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70",
        className
      )}
    >
      {children}
    </p>
  )
}

/** Serif italic word(s) inside a sans headline. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <em className="font-serif font-normal italic tracking-[-0.02em]">
      {children}
    </em>
  )
}

/** Marker-pen highlight behind a word in a headline. */
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-[0.12em] bg-highlight px-[0.08em] text-[#1f1512] [box-decoration-break:clone]">
      {children}
    </mark>
  )
}

/** Top-of-page intro for marketing subpages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={cn("pt-16 pb-12 sm:pt-24 sm:pb-16", className)}>
      <Container className="flex flex-col items-center text-center">
        {eyebrow ? (
          <Eyebrow>{eyebrow}</Eyebrow>
        ) : null}
        <h1 className="mt-5 max-w-4xl text-[2.6rem] leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {description}
          </p>
        ) : null}
        {children ? (
          <div className="mt-9 w-full">
            {children}
          </div>
        ) : null}
      </Container>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: "center" | "left"
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[3.5rem]",
          eyebrow && "mt-4"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}
