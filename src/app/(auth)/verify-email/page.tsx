import type { Metadata } from "next"
import { MailCheck } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { VerifyEmailDescription, VerifyEmailPanel } from "@/components/auth/verify-email-panel"

export const metadata: Metadata = { title: "Verify your email" }

export default function VerifyEmailPage() {
  return (
    <>
      <AuthHeading icon={<MailCheck />} title="Check your inbox" description={<VerifyEmailDescription />} />
      <VerifyEmailPanel />
      <AuthFooter>Can&apos;t find it? Check your spam folder, or wait a minute and resend.</AuthFooter>
    </>
  )
}
