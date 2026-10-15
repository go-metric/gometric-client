export const siteConfig = {
  name: "gometric",
  description:
    "Connect Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, and Pinterest. Schedule posts, manage your inbox, and track analytics in one place.",
  supportEmail: "hello@gometric.io",
}

export type NavLink = { href: string; label: string }

export const marketingNav: NavLink[] = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/features/planner", label: "Planner" },
      { href: "/features/inbox", label: "Inbox" },
      { href: "/features/analytics", label: "Analytics" },
      { href: "/features/compose", label: "Compose" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
]

export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  onboarding: {
    brand: "/onboarding",
    connect: "/onboarding/connect",
    ready: "/onboarding/ready",
  },
  dashboard: {
    overview: "/dashboard",
    planner: "/dashboard/planner",
    compose: "/dashboard/compose",
    inbox: "/dashboard/inbox",
    analytics: "/dashboard/analytics",
    settings: "/dashboard/settings",
    brands: "/dashboard/settings/brands",
    accounts: "/dashboard/settings/accounts",
    notifications: "/dashboard/settings/notifications",
    billing: "/dashboard/settings/billing",
  },
} as const
