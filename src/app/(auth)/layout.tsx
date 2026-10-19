import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed"
import { BrandWordmark } from "@/components/brand-wordmark"
import { FollowersCard, InboxCard } from "@/components/marketing/mocks"
import { Accent, Highlight } from "@/components/marketing/primitives"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-4 py-5 sm:px-8">
        <header className="flex items-center justify-between">
          <BrandWordmark size="sm" showIcon />
          <ThemeToggle />
        </header>
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <RedirectIfAuthed>{children}</RedirectIfAuthed>
        </main>
      </div>

      <aside className="relative isolate hidden overflow-hidden bg-[#1f1512] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_80%_110%,color-mix(in_srgb,#ff4d00_45%,transparent),transparent_70%)]"
        />
        <p className="max-w-md text-4xl leading-[1.1] font-normal tracking-[-0.03em] xl:text-5xl">
          Your social, <Accent>calmer</Accent>, all in <Highlight>one tab</Highlight>
        </p>
        <div className="relative mx-auto h-72 w-full max-w-md">
          <FollowersCard className="absolute top-0 left-0 -rotate-3 text-foreground" />
          <InboxCard className="absolute right-0 bottom-0 rotate-2 text-foreground" />
        </div>
        <p className="text-sm text-white/60">
          Plan, reply, and measure Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, and
          Pinterest.
        </p>
      </aside>
    </div>
  )
}
