import { BrandWordmark } from "@/components/brand-wordmark"
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps"
import { ThemeToggle } from "@/components/theme-toggle"

export default function OnboardingLayout({ children }: LayoutProps<"/onboarding">) {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,var(--tint-peach),transparent_70%)]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <BrandWordmark size="sm" showIcon href="" />
        <OnboardingSteps />
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pt-14">{children}</main>
    </div>
  )
}
