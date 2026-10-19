import type { Metadata } from "next"
import { Suspense } from "react"
import { MailCheck } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel"

export const metadata: Metadata = { title: "Verify your email" }

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams
  const email = params.email?.trim()

  return (
    <>
      <AuthHeading
        icon={<MailCheck />}
        title="Check your inbox"
        description={
          <>
            {email ? (
              <>
                We sent a verification link to <strong className="font-semibold text-foreground">{email}</strong>.
                Click it to activate your account.
              </>
            ) : (
              "Click the verification link we emailed you to activate your account."
            )}
          </>
        }
      />
      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading…</p>}>
        <VerifyEmailPanel fallbackEmail={email} />
      </Suspense>
      <AuthFooter>Can&apos;t find it? Check your spam folder, or wait a minute and resend.</AuthFooter>
    </>
  )
}
