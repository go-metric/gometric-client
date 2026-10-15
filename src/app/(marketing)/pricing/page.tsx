import type { Metadata } from "next"
import { Check, Minus, TriangleAlert } from "lucide-react"
import { Faq } from "@/components/marketing/faq"
import { FinalCta } from "@/components/marketing/final-cta"
import { Accent, Container, PageHero } from "@/components/marketing/primitives"
import { PricingPlans } from "@/components/marketing/pricing-plans"
import { pricingFaqs } from "@/config/faq"
import { comparison, plans } from "@/config/pricing"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free with one brand. Scale to Starter or Advanced as you add more brands.",
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Simple plans, <Accent>no surprises</Accent>
          </>
        }
        description="Start free with one brand. Upgrade when you need more brands, more posts, and longer history."
      >
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-dashed border-foreground/30 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <TriangleAlert className="size-3.5 text-brand" />
          Draft pricing: tiers and prices are placeholders
        </p>
      </PageHero>

      <section className="pb-24 sm:pb-32">
        <Container>
          <PricingPlans />
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <h2 className="text-3xl sm:text-4xl">
            Compare <Accent>every plan</Accent>
          </h2>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium text-muted-foreground sm:px-6">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-5 py-4 text-center text-base font-semibold sm:px-6">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((group) => (
                <tbody key={group.group} className="border-t border-border">
                  <tr>
                    <th colSpan={4} scope="colgroup" className="px-5 pt-6 pb-2 text-xs font-semibold tracking-[0.18em] text-foreground/60 uppercase sm:px-6">
                      {group.group}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-t border-border/60">
                      <th scope="row" className="px-5 py-3.5 font-normal sm:px-6">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td key={i} className="px-5 py-3.5 text-center sm:px-6">
                          {typeof v === "string" ? (
                            <span className="font-medium">{v}</span>
                          ) : v ? (
                            <Check className="mx-auto size-4 text-brand" strokeWidth={2.5} aria-label="Included" />
                          ) : (
                            <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Container>
      </section>

      <Faq items={pricingFaqs} title="Pricing questions" />
      <FinalCta />
    </>
  )
}
