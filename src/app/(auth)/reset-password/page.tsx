import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { LockKeyhole } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "Reset password" }

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading
        icon={<LockKeyhole />}
        title="Choose a new password"
        description="Make it at least 8 characters. You'll use it next time you log in."
      />
      <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
      <AuthFooter>
        <Link href={routes.login} className="font-semibold text-foreground hover:underline">
          Back to log in
        </Link>
      </AuthFooter>
    </>
  )
}
