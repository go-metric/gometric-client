import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { LoginForm } from "@/components/auth/login-form"
import { Accent } from "@/components/marketing/primitives"
import { ListSkeleton } from "@/components/dashboard/ui"
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
      <Suspense fallback={<ListSkeleton rows={4} className="mt-8" />}>
        <LoginForm />
      </Suspense>
      <AuthFooter>
        New to gometric?{" "}
        <Link href={routes.signup} className="font-semibold text-foreground hover:underline">
          Create a free account
        </Link>
      </AuthFooter>
    </>
  )
}
