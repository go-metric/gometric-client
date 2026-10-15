import type { Metadata } from "next"
import { MailCheck } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { Button, ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"
import { demoBrand } from "@/lib/demo-data"

export const metadata: Metadata = { title: "Verify your email" }

export default function VerifyEmailPage() {
  return (
    <>
      <AuthHeading
        icon={<MailCheck />}
        title="Check your inbox"
        description={
          <>
            We sent a verification link to{" "}
            <strong className="font-semibold text-foreground">{demoBrand.owner.email}</strong>. Click it to
            activate your account.
          </>
        }
      />
      <div className="mt-8 space-y-3">
        <ButtonLink variant="ink" size="lg" className="w-full rounded-xl" href={routes.onboarding.brand}>
          I&apos;ve verified — continue
        </ButtonLink>
        <Button variant="outline" size="lg" className="w-full rounded-xl">
          Resend email
        </Button>
      </div>
      <AuthFooter>Can&apos;t find it? Check your spam folder, or wait a minute and resend.</AuthFooter>
    </>
  )
}
