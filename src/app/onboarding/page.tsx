import type { Metadata } from "next"
import { Suspense } from "react"
import { ListSkeleton } from "@/components/dashboard/ui"
import { Accent } from "@/components/marketing/primitives"
import { CreateBrandForm } from "@/components/onboarding/create-brand-form"
import { StepHeading } from "@/components/onboarding/step-heading"

export const metadata: Metadata = { title: "Create your brand" }

export default function CreateBrandPage() {
  return (
    <>
      <StepHeading
        step="Step 1 of 3"
        title={
          <>
            Tell us about your <Accent>brand</Accent>
          </>
        }
        description="Your brand is the workspace for everything — calendar, inbox, and analytics."
      />
      <Suspense fallback={<ListSkeleton rows={5} className="mt-10" />}>
        <CreateBrandForm />
      </Suspense>
    </>
  )
}
