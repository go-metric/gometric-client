import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { AuthForm } from "@/components/auth/auth-form"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      <AuthForm kind="forgot" className="mt-8 space-y-5">
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
        </FormField>
        <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl">
          Send reset link
        </Button>
      </AuthForm>
      <AuthFooter>
        Remembered it?{" "}
        <Link href={routes.login} className="font-semibold text-foreground hover:underline">
          Back to log in
        </Link>
      </AuthFooter>
    </>
  )
}
