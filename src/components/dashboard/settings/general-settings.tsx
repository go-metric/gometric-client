"use client"

import type { FormEvent } from "react"
import { toast } from "sonner"
import { EmptyState, ErrorState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { FormField, selectClassName } from "@/components/form-field"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { industries, timezones } from "@/config/workspace"
import { routes } from "@/config/site"
import { activeBrand } from "@/lib/api/workspace"
import type { Brand, Workspace } from "@/lib/api/types"
import { useUpdateBrand, useUpdateProfile, useWorkspace } from "@/lib/queries/workspace"

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim()

export function GeneralSettings() {
  const { data, error, refetch } = useWorkspace()
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data) return <ListSkeleton rows={6} />
  const brand = activeBrand(data)
  return (
    <div className="space-y-4">
      {brand ? <BrandForm brand={brand} /> : <NoActiveBrand />}
      <ProfileForm workspace={data} />
    </div>
  )
}

function NoActiveBrand() {
  return (
    <Panel title="Brand">
      <EmptyState
        title="No brand selected"
        description="Create a brand to edit its profile and connect networks."
        action={
          <ButtonLink href={routes.dashboard.brands} variant="ink" size="sm">
            Manage brands
          </ButtonLink>
        }
      />
    </Panel>
  )
}

function BrandForm({ brand }: { brand: Brand }) {
  const update = useUpdateBrand()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    update.mutate(
      {
        id: brand.id,
        name: field(form, "name"),
        handle: field(form, "handle"),
        website: field(form, "website"),
        industry: field(form, "industry"),
        timezone: field(form, "timezone"),
      },
      { onSuccess: () => toast.success("Brand updated") }
    )
  }

  return (
    <Panel title="Brand">
      <form key={brand.id} onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="brand-name" label="Brand name">
            <Input id="brand-name" name="name" defaultValue={brand.name} required />
          </FormField>
          <FormField id="brand-handle" label="Handle">
            <Input id="brand-handle" name="handle" defaultValue={brand.handle} placeholder="@brand" />
          </FormField>
          <FormField id="brand-website" label="Website">
            <Input id="brand-website" name="website" defaultValue={brand.website} placeholder="https://" />
          </FormField>
          <FormField id="brand-industry" label="Industry">
            <select id="brand-industry" name="industry" className={selectClassName} defaultValue={brand.industry}>
              {industries.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="brand-timezone" label="Timezone" hint="Used for best-time suggestions and reports." className="sm:col-span-2">
            <SearchableSelect
              id="brand-timezone"
              name="timezone"
              options={timezones}
              defaultValue={brand.timezone}
              placeholder="Search timezones…"
            />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="ink" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Panel>
  )
}

function ProfileForm({ workspace }: { workspace: Workspace }) {
  const update = useUpdateProfile()
  const { profile } = workspace

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    update.mutate(
      { name: field(form, "name"), email: field(form, "email") },
      { onSuccess: () => toast.success("Profile updated") }
    )
  }

  return (
    <Panel title="Profile">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="owner-name" label="Full name">
            <Input id="owner-name" name="name" autoComplete="name" defaultValue={profile.name} required />
          </FormField>
          <FormField id="owner-email" label="Email">
            <Input id="owner-email" name="email" type="email" autoComplete="email" defaultValue={profile.email} required />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="ink" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Update profile"}
          </Button>
        </div>
      </form>
    </Panel>
  )
}
