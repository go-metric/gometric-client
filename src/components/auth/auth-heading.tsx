import type { ReactNode } from "react"

export function AuthHeading({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <div>
      {icon ? (
        <span className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-tint-peach text-brand [&_svg]:size-6">
          {icon}
        </span>
      ) : null}
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-8 text-center text-sm text-muted-foreground">{children}</p>
}
