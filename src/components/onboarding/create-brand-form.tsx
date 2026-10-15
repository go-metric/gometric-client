"use client"

import { useRouter } from "next/navigation"
import type { FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { ListSkeleton } from "@/components/dashboard/ui"
import { FormField, selectClassName } from "@/components/form-field"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/site"
import { industries, timezones } from "@/config/workspace"
import { activeBrand } from "@/lib/api/workspace"
import { initials } from "@/lib/format"
import { useCreateBrand, useUpdateBrand, useWorkspace } from "@/lib/queries/workspace"

export function CreateBrandForm() {
  const router = useRouter()
  const { data } = useWorkspace()
  const create = useCreateBrand()
  const update = useUpdateBrand()

  if (!data) return <ListSkeleton rows={5} className="mt-10" />
  const brand = activeBrand(data)
  const pending = create.isPending || update.isPending

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("brand") ?? "").trim()
    const payload = {
      name,
      handle: (brand?.handle || `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`).trim(),
      website: String(form.get("website") ?? "").trim(),
      industry: String(form.get("industry")),
      timezone: String(form.get("timezone")),
    }
    const go = () => router.push(routes.onboarding.connect)
    if (brand) {
      update.mutate({ id: brand.id, ...payload }, { onSuccess: go })
    } else {
      create.mutate(payload, { onSuccess: go })
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-10">
      <div className="flex items-center gap-4">
        <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-2xl bg-ink text-lg font-semibold text-ink-foreground">
          {brand?.name ? initials(brand.name) : "?"}
        </span>
        <div>
          <p className="text-sm font-medium">Brand logo</p>
          <p className="text-xs text-muted-foreground">Generated from your brand name. Uploads are coming soon.</p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <FormField id="brand" label="Brand name" className="sm:col-span-2">
          <Input id="brand" name="brand" defaultValue={brand?.name ?? ""} placeholder="Northwind Studio" required autoFocus />
        </FormField>
        <FormField id="website" label="Website" hint="Optional.">
          <Input id="website" name="website" defaultValue={brand?.website ?? ""} placeholder="https://northwind.co" />
        </FormField>
        <FormField id="industry" label="Industry">
          <select id="industry" name="industry" className={selectClassName} defaultValue={brand?.industry ?? "other"}>
            {industries.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="timezone" label="Timezone" hint="Used for best-time suggestions." className="sm:col-span-2">
          <SearchableSelect
            id="timezone"
            name="timezone"
            options={timezones}
            defaultValue={brand?.timezone ?? "UTC"}
            placeholder="Search timezones…"
          />
        </FormField>
      </div>
      <Button type="submit" variant="ink" size="lg" className="mt-8 w-full rounded-xl" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
        <ArrowRight data-icon="inline-end" className="text-brand" />
      </Button>
    </form>
  )
}
