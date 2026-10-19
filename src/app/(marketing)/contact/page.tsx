import type { Metadata } from "next"
import { BookOpen, Mail, MessageSquare } from "lucide-react"
import { ContactForm } from "@/components/marketing/contact-form"
import { Accent, Container, PageHero } from "@/components/marketing/primitives"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback, or partnerships. We'd love to hear from you.",
}

const channels = [
  {
    Icon: Mail,
    title: "Email us",
    body: "We usually reply within one business day.",
    action: { label: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
    tint: "bg-tint-peach",
  },
  {
    Icon: BookOpen,
    title: "Read the FAQ",
    body: "Quick answers about connecting accounts and plans.",
    action: { label: "See pricing FAQ", href: "/pricing#faq" },
    tint: "bg-tint-sky",
  },
  {
    Icon: MessageSquare,
    title: "Share feedback",
    body: "Tell us what would make gometric calmer for you.",
    action: { label: "Use the form", href: "#contact-form" },
    tint: "bg-tint-lime",
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s <Accent>talk</Accent>
          </>
        }
        description="Questions about gometric, feedback on the product, or a partnership idea. Send it our way."
      />

      <section className="pb-24 sm:pb-32">
        <Container className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {channels.map((c) => (
              <li key={c.title} className={`rounded-3xl p-6 ${c.tint}`}>
                <c.Icon className="size-6" />
                <h2 className="mt-6 text-xl font-semibold">{c.title}</h2>
                <p className="mt-1.5 text-sm text-foreground/70">{c.body}</p>
                <a href={c.action.href} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
                  {c.action.label}
                </a>
              </li>
            ))}
          </ul>

          <ContactForm />
        </Container>
      </section>
    </>
  )
}
