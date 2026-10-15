import type { Metadata } from "next"
import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import { AuthFooter, AuthHeading } from "@/components/auth/auth-heading"
import { DemoForm } from "@/components/demo-form"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      <DemoForm next={routes.login} className="mt-8 space-y-5">
        <FormField id="password" label="New password">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </FormField>
        <FormField id="confirm" label="Confirm password">
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </FormField>
        <Button type="submit" variant="ink" size="lg" className="w-full rounded-xl">
          Update password
        </Button>
      </DemoForm>
      <AuthFooter>
        <Link href={routes.login} className="font-semibold text-foreground hover:underline">
          Back to log in
        </Link>
      </AuthFooter>
    </>
  )
}
