import type { Metadata } from "next"
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, stores, and shares your information, including data from Google and YouTube APIs.`,
}

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: [
      `This Privacy Policy describes how ${siteConfig.name} ("${siteConfig.name}", "we", "us", or "our") collects, uses, stores, and shares information when you use our website at https://gometric.social and related services (the "Service").`,
      `${siteConfig.name} is a social media management platform. You connect your own social accounts so you can compose and schedule posts, manage inbox messages and comments, view analytics, and download reports from one place.`,
      `By creating an account or using the Service, you agree to this Policy. If you do not agree, please do not use the Service.`,
    ],
  },
  {
    id: "who-we-are",
    title: "Who we are",
    body: [
      `The Service is operated under the ${siteConfig.name} brand. For privacy questions or requests, contact us at ${siteConfig.supportEmail}.`,
      `Our public website and product home page is https://gometric.social/.`,
    ],
  },
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: [
      "Account and profile information you provide: name, email address, password (stored hashed), brand or workspace name, handle, website, industry, timezone, and similar settings you enter in the product.",
      "Billing-related details needed to manage your plan (for example plan type and payment status). Card details, when used, are processed by our payment provider and are not stored in full on our servers.",
      "Content you create in the Service: post captions, media you upload, schedules, drafts, reports you generate, and preferences such as which networks to include in inbox or analytics.",
      "Technical and usage data: IP address, browser type, device information, approximate location derived from IP, pages viewed, and product events needed to operate, secure, and improve the Service. We may use cookies or similar technologies for authentication, preferences, and analytics.",
      "Communications you send us (for example support emails).",
    ],
  },
  {
    id: "social-network-data",
    title: "Information from connected social networks",
    body: [
      "When you connect a social network, you authorize us through that network's official sign-in (OAuth or equivalent). We only receive data permitted by the scopes you approve on that network's consent screen.",
      "Depending on the network and permissions you grant, this can include account identifiers and handles, profile pictures, follower counts, posts and media metadata, comments, direct messages or inbox threads, publishing results, and performance or insights metrics.",
      "Networks you may connect include Instagram, TikTok, YouTube, X, LinkedIn, Threads, Pinterest, Facebook, and Google Business Profile, as available in the product. Each network's own terms and privacy policy also apply to data they hold.",
      "We store access and refresh tokens (or equivalent credentials) needed to act on your behalf. Tokens are stored encrypted at rest. You can disconnect a network at any time from Settings → Accounts, which stops new access with that connection.",
    ],
  },
  {
    id: "google-youtube",
    title: "Google and YouTube API services",
    body: [
      `${siteConfig.name} uses Google APIs, including the YouTube Data API and YouTube Analytics API, so you can connect your YouTube channel, view channel and video information, upload or manage videos you choose to publish through the Service, read and reply to comments when you grant that permission, and view analytics insights.`,
      "Google user data we may receive when you connect YouTube (subject to the scopes you approve) includes: your Google account identifiers needed for OAuth; YouTube channel id, title, custom URL or handle, and thumbnail; video metadata and status for videos you manage through the Service; comment threads you choose to view or reply to; and aggregated analytics metrics such as views and engagement for your channel or videos.",
      `${siteConfig.name}'s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`,
      "We do not use Google or YouTube data to serve ads. We do not sell Google or YouTube user data. We do not allow humans to read Google user data unless you give us permission for support, it is necessary for security or compliance, or we are required to by law — and then only with appropriate access controls.",
      `You can revoke ${siteConfig.name}'s access to your Google Account at any time in your Google Account permissions (https://myaccount.google.com/permissions) and by disconnecting YouTube inside Settings → Accounts in the Service.`,
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    body: [
      "To provide the Service: authenticate you, connect networks, schedule and publish content you create, sync inbox and comments, calculate analytics, generate reports, and send transactional emails (for example login, password reset, or scheduled report delivery).",
      "To operate, maintain, secure, troubleshoot, and improve the Service, including preventing abuse and enforcing our Terms of Service.",
      "To communicate with you about your account, product changes, and support requests.",
      "To comply with law and respond to lawful requests.",
      "We use data from connected networks only to provide the features you enable for those networks. We do not use that data for unrelated profiling or advertising to third parties.",
    ],
  },
  {
    id: "legal-bases",
    title: "Legal bases (where applicable)",
    body: [
      "Where data-protection laws require a legal basis, we typically rely on: performance of our contract with you (providing the Service); your consent (for example connecting a social network or optional analytics cookies); legitimate interests in securing and improving the Service that are not overridden by your rights; and legal obligations when they apply.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    body: [
      "We do not sell your personal information.",
      "We share information with: (1) social networks you connect, when you publish content or sync data through their APIs; (2) service providers who process data for us under contract (for example hosting, email delivery, error monitoring, and payment processing); (3) professional advisors when needed; and (4) authorities when required by law or to protect rights and safety.",
      "If we are involved in a merger, acquisition, or asset sale, information may transfer as part of that transaction under continued confidentiality commitments where required.",
    ],
  },
  {
    id: "retention",
    title: "Storage, security, and retention",
    body: [
      "We store Service data on infrastructure we control or that is provided by our hosting providers. We use encryption in transit (HTTPS) and encrypt sensitive credentials such as social network tokens at rest.",
      "No method of transmission or storage is 100% secure. We work to protect your information but cannot guarantee absolute security.",
      "We retain account and product data for as long as your account is active and as needed to provide the Service. After you delete your account or disconnect a network, we delete or anonymize associated personal data within a reasonable period, except where we must retain information for legal, security, or dispute-resolution purposes. Backups may persist for a limited time before rotation.",
    ],
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    body: [
      "You can access and update much of your account and brand information in Settings.",
      "You can disconnect any social network from Settings → Accounts. Disconnecting stops new API access with that connection; content already published on the network remains under that network's control.",
      `You can request access, correction, deletion, or export of personal information we hold about you, or object to certain processing, by emailing ${siteConfig.supportEmail}. We may need to verify your identity before fulfilling a request.`,
      "Depending on where you live, you may have additional rights under local law (for example GDPR or CCPA). We will honor applicable requests.",
      "You can unsubscribe from non-essential marketing emails using the link in those emails. Transactional emails related to your account will still be sent as needed to operate the Service.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: [
      "We use essential cookies to keep you signed in and to remember security and preference settings.",
      "We may use analytics tools (including Google Analytics where enabled) to understand how the marketing site and product are used. Where required, we will obtain consent for non-essential cookies.",
      "You can control cookies through your browser settings. Blocking essential cookies may prevent parts of the Service from working.",
    ],
  },
  {
    id: "international",
    title: "International transfers",
    body: [
      "We may process information in countries other than where you live. When we transfer personal data internationally, we use appropriate safeguards required by applicable law (for example contractual protections with processors).",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      `The Service is not directed to children under 16 (or the minimum age required in your country). We do not knowingly collect personal information from children. If you believe a child has provided us information, contact ${siteConfig.supportEmail} and we will take appropriate steps to delete it.`,
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. We will change the “Last updated” date at the top of this page and, when changes are material, provide additional notice as appropriate (for example by email or an in-product message).",
      "Continued use of the Service after an update means you accept the revised Policy, except where applicable law requires otherwise.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      `For privacy questions, data requests, or complaints, email ${siteConfig.supportEmail}.`,
      "Website: https://gometric.social/",
    ],
  },
]

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="October 23, 2026" sections={sections} draft={false} />
}
