import type { Metadata } from "next"
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = { title: "Privacy policy" }

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: [
      `This policy explains what information ${siteConfig.name} collects, why we collect it, and the choices you have.`,
    ],
  },
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: [
      "Account details you provide, such as your name, email address, and brand name.",
      "Data from social networks you connect, limited to the permissions you approve during sign-in with each network.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    body: [
      "To schedule and publish your posts, show your inbox, and calculate analytics for your connected accounts.",
      "To operate, secure, and improve the service, and to contact you about your account.",
    ],
  },
  {
    id: "connected-accounts",
    title: "Connected accounts",
    body: [
      "You connect networks through their official sign-in (OAuth). You can disconnect an account at any time from Settings → Connected accounts.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [`Questions about privacy? Email ${siteConfig.supportEmail}.`],
  },
]

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="October 2026" sections={sections} />
}
