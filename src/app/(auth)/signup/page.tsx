import type { Metadata } from "next"
import Link from "next/link"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { AuthForm } from "@/components/auth/auth-form"
import { FormField } from "@/components/form-field"
import { Accent } from "@/components/marketing/primitives"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "Create account" }

export default function SignupPage() {
  return (
    <>
      <AuthHeading
        title={
          <>
            Start for <Accent>free</Accent>
          </>
        }
        description="Create your account, then connect the networks your brand runs on."
      />
      <AuthForm kind="signup" className="mt-8 space-y-5">
        <FormField id="name" label="Full name">
          <Input id="name" name="name" autoComplete="name" placeholder="Emily Carter" required />
        </FormField>
        <FormField id="email" label="Work email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
        </FormField>
        <FormField id="password" label="Password" hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </FormField>
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox name="terms" className="mt-0.5" required />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-foreground underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">
              Privacy policy
            </Link>
            .
          </span>
        </label>
        <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl">
          Create account
        </Button>
      </AuthForm>
      <AuthFooter>
        Already have an account?{" "}
        <Link href={routes.login} className="font-semibold text-foreground hover:underline">
          Log in
        </Link>
      </AuthFooter>
    </>
  )
}
