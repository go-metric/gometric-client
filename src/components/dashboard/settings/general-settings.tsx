"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { EmptyState, ErrorState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { FormField, selectClassName } from "@/components/form-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { industries, timezones } from "@/config/workspace"
import { routes } from "@/config/site"
import { activeBrand } from "@/lib/api/workspace"
import type { Brand, Workspace } from "@/lib/api/types"
import {
  useResetDemo,
  useUpdateBrand,
  useUpdateProfile,
  useWorkspace,
} from "@/lib/queries/workspace"

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
      <DangerZone />
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

function DangerZone() {
  const reset = useResetDemo()
  const [open, setOpen] = useState(false)

  return (
    <Panel title="Danger zone">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Reset demo data</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Clears the in-browser mock database and reseeds Northwind. Real accounts are unaffected once
            the service is wired up.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/8"
          onClick={() => setOpen(true)}
        >
          Reset demo data
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              Posts, inbox threads, connected accounts, and billing state go back to the seed workspace.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={reset.isPending}
              onClick={() =>
                reset.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Demo data reset")
                    setOpen(false)
                  },
                })
              }
            >
              {reset.isPending ? "Resetting…" : "Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  )
}
