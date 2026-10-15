import type { Metadata } from "next"
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = { title: "Terms of service" }

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: [`By creating an account you agree to these terms and to use ${siteConfig.name} in line with them.`],
  },
  {
    id: "accounts",
    title: "Your account",
    body: [
      "You're responsible for your login details and for activity in your brand workspace.",
      "You must have the right to manage every social account you connect.",
    ],
  },
  {
    id: "content",
    title: "Your content",
    body: [
      "You own the content you create and publish. You give us permission to process it only to provide the service.",
      "You remain responsible for complying with each social network's own terms and policies.",
    ],
  },
  {
    id: "plans",
    title: "Plans and billing",
    body: ["Paid plans renew automatically until cancelled. You can change or cancel your plan at any time."],
  },
  {
    id: "termination",
    title: "Ending the service",
    body: ["You can delete your account at any time. We may suspend accounts that break these terms."],
  },
]

export default function TermsPage() {
  return <LegalPage title="Terms of service" updated="October 2026" sections={sections} />
}
