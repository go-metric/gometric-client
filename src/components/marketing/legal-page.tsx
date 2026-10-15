import Link from "next/link"
import { TriangleAlert } from "lucide-react"
import { Container, Eyebrow } from "@/components/marketing/primitives"

export type LegalSection = { id: string; title: string; body: string[] }

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: LegalSection[]
}) {
  return (
    <Container className="pt-16 pb-24 sm:pt-24 sm:pb-32">
      <header className="max-w-3xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-5 text-5xl leading-[1.05] tracking-[-0.035em] sm:text-6xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">Last updated {updated}</p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-foreground/30 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <TriangleAlert className="size-3.5 text-brand" />
          Placeholder text. Needs legal review before launch
        </p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-28 space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <Link href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                  {i + 1}. {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-foreground/75">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  )
}
