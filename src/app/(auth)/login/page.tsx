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

export const metadata: Metadata = { title: "Log in" }

export default function LoginPage() {
  return (
    <>
      <AuthHeading
        title={
          <>
            Welcome <Accent>back</Accent>
          </>
        }
        description="Log in to plan, reply, and measure across your connected accounts."
      />
      <AuthForm kind="login" className="mt-8 space-y-5">
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
        </FormField>
        <FormField
          id="password"
          label="Password"
          action={
            <Link href={routes.forgotPassword} className="text-xs font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          }
        >
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </FormField>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox name="remember" defaultChecked />
          Keep me logged in
        </label>
        <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl">
          Log in
        </Button>
      </AuthForm>
      <AuthFooter>
        New to gometric?{" "}
        <Link href={routes.signup} className="font-semibold text-foreground hover:underline">
          Create a free account
        </Link>
      </AuthFooter>
    </>
  )
}
