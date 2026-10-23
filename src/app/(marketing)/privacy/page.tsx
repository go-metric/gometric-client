import type { Metadata } from "next"
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, stores, and shares your information, including Google and YouTube user data under the Google API Services User Data Policy (Limited Use).`,
}

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: [
      `This Privacy Policy explains how ${siteConfig.name} ("${siteConfig.name}", "we", "us", or "our") accesses, collects, uses, stores, shares, and deletes information when you use https://gometric.social and the related ${siteConfig.name} product (the "Service").`,
      `${siteConfig.name} is a social media management platform. After you create an account, you can connect your own social accounts (including YouTube via Google OAuth) to compose and schedule posts, manage inbox messages and comments, view analytics, and download reports.`,
      "This Policy applies to personal information and to Google user data obtained through Google APIs. By creating an account or using the Service, you agree to this Policy. If you do not agree, do not use the Service.",
      `Effective date / last updated: October 23, 2026. Contact: ${siteConfig.supportEmail}.`,
    ],
  },
  {
    id: "who-we-are",
    title: "Who we are and how to contact us",
    body: [
      `The Service is provided under the ${siteConfig.name} brand. Our public homepage is https://gometric.social/. This Privacy Policy is also linked from that homepage (footer → Privacy policy) and from our Google OAuth consent screen.`,
      `Privacy requests, questions, and complaints: ${siteConfig.supportEmail}.`,
    ],
  },
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: [
      "Account and profile information you provide: name, email address, password (stored hashed), brand or workspace name, handle, website, industry, timezone, and similar settings you enter in the product.",
      "Billing-related details needed to manage your plan (for example plan type and payment status). Full payment card numbers, when used, are processed by our payment provider and are not stored in full on our servers.",
      "Content you create in the Service: post captions, titles, media files you upload, schedules, drafts, publishing logs, reports you generate, and preferences such as which networks to include in inbox or analytics.",
      "Technical and usage data: IP address, browser type, device information, approximate location derived from IP, pages viewed, referrers, and product events needed to operate, secure, debug, and improve the Service.",
      "Communications you send us (for example support emails) and information needed to respond.",
    ],
  },
  {
    id: "social-network-data",
    title: "Information from connected social networks",
    body: [
      "When you connect a social network, you authorize us through that network’s official sign-in (OAuth or equivalent). We only receive data allowed by the scopes or permissions you approve on that network’s consent screen.",
      "Depending on the network and permissions you grant, this can include account identifiers and handles, profile pictures, follower counts, posts and media metadata, comments, direct messages or inbox threads, publishing results, and performance or insights metrics.",
      "Networks you may connect include Instagram, TikTok, YouTube (via Google), X, LinkedIn, Threads, Pinterest, Facebook, and Google Business Profile, as available in the product. Each network’s own terms and privacy policy also apply to data they hold.",
      "We store access tokens, refresh tokens, and related credentials needed to act on your behalf. Those credentials are encrypted at rest. You can disconnect a network at any time from Settings → Accounts, which stops new API access with that connection.",
    ],
  },
  {
    id: "google-youtube",
    title: "Google user data and YouTube API services",
    body: [
      `${siteConfig.name} uses Google OAuth and Google APIs — specifically the YouTube Data API v3 and the YouTube Analytics API — so you can connect your own YouTube channel and use YouTube features inside ${siteConfig.name}.`,
      "Google OAuth scopes we may request (only as needed for the features you use): https://www.googleapis.com/auth/youtube.readonly (read channel and video metadata); https://www.googleapis.com/auth/yt-analytics.readonly (read YouTube Analytics metrics); https://www.googleapis.com/auth/youtube.upload (upload or update videos you choose to publish through the Service); and https://www.googleapis.com/auth/youtube.force-ssl (manage comments and related YouTube Data API write operations that require this scope, such as deleting a video you uploaded through the Service).",
      "Google / YouTube user data we may access or receive when you connect YouTube (subject to the scopes you approve) includes: Google account identifiers required for OAuth; YouTube channel id, title, custom URL or handle, and thumbnail; lists of your channel’s videos and their metadata (title, description, privacy status, thumbnails, statistics); video files and metadata you choose to upload or manage through the Service; comment threads on your videos that you choose to view or reply to; and aggregated analytics metrics for your channel or videos (for example views and engagement).",
      `How we access Google user data: only after you click Connect for YouTube and complete Google’s OAuth consent screen. We call Google/YouTube APIs using tokens issued to ${siteConfig.name} for your account.`,
      "How we use Google user data: solely to provide and improve user-facing YouTube features that are prominent in the Service — connecting your channel, showing channel and video information, publishing or updating videos you create, reading and replying to comments you choose to manage, showing analytics, and generating reports you request. We do not use Google user data for any other purpose.",
      "How we store Google user data: OAuth tokens are stored encrypted at rest on our servers/hosting providers. Channel metadata, video metadata, comment content synced for inbox features, analytics snapshots, and publishing logs may be stored in our database so the product can display them to you. We use HTTPS in transit.",
      "How we share Google user data: we do not sell Google user data. We do not share Google user data with third parties for advertising, data brokerage, or credit decisions. We may share Google user data with infrastructure processors that host or operate the Service under contract (for example cloud hosting), when required to provide the feature you requested (for example sending a publish request back to YouTube), for security investigations, to comply with law, or as part of a merger/acquisition with prior notice where required. We do not transfer Google user data to other apps you have not authorized.",
      `${siteConfig.name}'s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`,
    ],
  },
  {
    id: "limited-use",
    title: "Google Limited Use commitments",
    body: [
      "In addition to the rest of this Policy, when we process Google user data obtained through Google APIs we commit to the following Limited Use rules:",
      `Google user data is used only to provide or improve user-facing features that are prominent in the ${siteConfig.name} interface (YouTube connect, publish, comments, analytics, and reports).`,
      "We do not use Google user data to serve advertisements, including personalized, retargeting, or interest-based ads.",
      "We do not sell Google user data to third parties such as advertising platforms, data brokers, or information resellers.",
      "We do not use Google user data for determining credit-worthiness or for lending.",
      "We do not allow humans to read Google user data unless: (a) you give us affirmative permission for a support request about specific data; (b) it is necessary for security purposes (for example investigating abuse); (c) it is necessary to comply with applicable law; or (d) the data is aggregated and used for internal operations in line with applicable law.",
      "We do not use Google user data to train generalized artificial intelligence or machine learning models.",
      `You may revoke ${siteConfig.name}'s access to your Google Account at any time at https://myaccount.google.com/permissions and by disconnecting YouTube in Settings → Accounts. After disconnect or account deletion, we delete or anonymize stored Google user data associated with that connection within 30 days, except where we must retain a limited record for security, dispute resolution, or legal compliance (for example billing records).`,
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information (all Service data)",
    body: [
      "To provide the Service: authenticate you, connect networks, schedule and publish content you create, sync inbox and comments, calculate analytics, generate reports, and send transactional emails (login, password reset, scheduled report delivery, and similar).",
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
      "Where data-protection laws require a legal basis, we typically rely on: performance of our contract with you (providing the Service); your consent (for example connecting a social network via OAuth, or optional analytics cookies); legitimate interests in securing and improving the Service that are not overridden by your rights; and legal obligations when they apply.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    body: [
      "We do not sell your personal information.",
      "We share information with: (1) social networks you connect, when you publish content or sync data through their APIs (including YouTube/Google when you use those features); (2) service providers who process data for us under contract (hosting, email delivery, error monitoring, and payment processing); (3) professional advisors when needed; and (4) authorities when required by law or to protect rights and safety.",
      "If we are involved in a merger, acquisition, or asset sale, information may transfer as part of that transaction under continued confidentiality commitments where required, and with notice or consent where the law requires it — including for Google user data.",
    ],
  },
  {
    id: "retention",
    title: "Storage, security, and retention",
    body: [
      "We store Service data on infrastructure we control or that is provided by our hosting providers. We use encryption in transit (HTTPS) and encrypt sensitive credentials such as social network and Google OAuth tokens at rest.",
      "No method of transmission or storage is 100% secure. We work to protect your information but cannot guarantee absolute security.",
      "We retain account and product data for as long as your account is active and as needed to provide the Service. After you delete your account or disconnect a network, we delete or anonymize associated personal data within a reasonable period (for Google user data, within 30 days as described above), except where we must retain information for legal, security, or dispute-resolution purposes. Backups may persist for a limited time before rotation.",
    ],
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    body: [
      "You can access and update much of your account and brand information in Settings.",
      "You can disconnect any social network, including YouTube, from Settings → Accounts. Disconnecting stops new API access with that connection; content already published on the network remains under that network’s control.",
      `You can request access, correction, deletion, or export of personal information we hold about you (including Google user data we store), or object to certain processing, by emailing ${siteConfig.supportEmail}. We may need to verify your identity before fulfilling a request.`,
      "Depending on where you live, you may have additional rights under local law (for example GDPR or CCPA). We will honor applicable requests.",
      "You can unsubscribe from non-essential marketing emails using the link in those emails. Transactional emails related to your account will still be sent as needed to operate the Service.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: [
      "We use essential cookies to keep you signed in and to remember security and preference settings.",
      "We may use analytics tools (including Google Analytics where enabled on our marketing site) to understand how the website and product are used. Where required, we will obtain consent for non-essential cookies. Google Analytics is separate from YouTube Data/Analytics API access you grant when connecting YouTube inside the product.",
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
      "Continued use of the Service after an update means you accept the revised Policy, except where applicable law requires otherwise. Material changes to how we handle Google user data will be reflected in this Policy before those practices change.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      `For privacy questions, Google user data requests, or complaints, email ${siteConfig.supportEmail}.`,
      "Website / homepage: https://gometric.social/",
      "Privacy policy URL: https://gometric.social/privacy",
    ],
  },
]

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="October 23, 2026" sections={sections} draft={false} />
}
