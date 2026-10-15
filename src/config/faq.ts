export type FaqItem = { q: string; a: string }

export const generalFaqs: FaqItem[] = [
  {
    q: "Which social networks can I connect?",
    a: "Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, and Pinterest. You can connect one profile per network to your brand workspace.",
  },
  {
    q: "How does connecting an account work?",
    a: "You sign in through each network's official login (OAuth) and approve access. gometric never sees or stores your social passwords.",
  },
  {
    q: "What is a brand in gometric?",
    a: "A brand is the workspace for one business. Under it you manage your connected profiles, your calendar, your inbox, and your analytics together.",
  },
  {
    q: "Can I schedule the same post to several networks?",
    a: "Yes. Write once in the composer, select the networks, tailor the copy for each one if you like, and schedule it in a single step.",
  },
  {
    q: "Do I need a credit card to get started?",
    a: "No. Create a free account with your email and start connecting your networks right away.",
  },
]

export const pricingFaqs: FaqItem[] = [
  {
    q: "Can I cancel at any time?",
    a: "Yes. You keep your plan until the end of the current billing period, then your account moves to Free.",
  },
  {
    q: "Can I switch plans later?",
    a: "Upgrade or downgrade whenever you like from Settings. Upgrades apply immediately; downgrades apply at the next billing date.",
  },
  {
    q: "Is there a discount for paying yearly?",
    a: "Yes — yearly billing costs about 20% less than paying month to month.",
  },
  generalFaqs[4],
]
