import type { Metadata } from "next"
import Link from "next/link"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { SignupForm } from "@/components/auth/signup-form"
import { Accent } from "@/components/marketing/primitives"
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
      <SignupForm />
      <AuthFooter>
        Already have an account?{" "}
        <Link href={routes.login} className="font-semibold text-foreground hover:underline">
          Log in
        </Link>
      </AuthFooter>
    </>
  )
}
