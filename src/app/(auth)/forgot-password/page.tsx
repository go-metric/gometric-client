import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        icon={<KeyRound />}
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to choose a new one."
      />
      <ForgotPasswordForm />
      <AuthFooter>
        Remembered it?{" "}
        <Link href={routes.login} className="font-semibold text-foreground hover:underline">
          Back to log in
        </Link>
      </AuthFooter>
    </>
  )
}
