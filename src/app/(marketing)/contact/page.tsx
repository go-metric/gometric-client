import type { Metadata } from "next"
import { BookOpen, Mail, MessageSquare } from "lucide-react"
import { AuthForm } from "@/components/auth/auth-form"
import { FormField, selectClassName } from "@/components/form-field"
import { Accent, Container, PageHero } from "@/components/marketing/primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

          <AuthForm
            kind="contact"
            id="contact-form"
            className="scroll-mt-24 rounded-[2rem] border border-border bg-card p-6 sm:p-10"
          >
            <h2 className="text-2xl font-semibold sm:text-3xl">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">All fields are required.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <FormField id="name" label="Name">
                <Input id="name" name="name" autoComplete="name" placeholder="Emily Carter" required />
              </FormField>
              <FormField id="email" label="Email">
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
              </FormField>
              <FormField id="topic" label="Topic" className="sm:col-span-2">
                <select id="topic" name="topic" className={selectClassName} defaultValue="question">
                  <option value="question">General question</option>
                  <option value="feedback">Product feedback</option>
                  <option value="billing">Billing</option>
                  <option value="partnership">Partnership</option>
                </select>
              </FormField>
              <FormField id="message" label="Message" className="sm:col-span-2">
                <Textarea id="message" name="message" rows={6} placeholder="How can we help?" required />
              </FormField>
            </div>
            <Button type="submit" variant="ink" size="lg" className="mt-8 w-full rounded-2xl sm:w-auto sm:px-8">
              Send message
            </Button>
          </AuthForm>
        </Container>
      </section>
    </>
  )
}
