"use client"

import { useState } from "react"
import { Building2, Lock, Plus } from "lucide-react"
import { toast } from "sonner"
import { EmptyState, ErrorState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { FormField, selectClassName } from "@/components/form-field"
import { SearchableSelect } from "@/components/ui/searchable-select"
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
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { industries, timezones } from "@/config/workspace"
import { routes } from "@/config/site"
import type { Brand } from "@/lib/api/types"
import { initials } from "@/lib/format"
import { useBilling } from "@/lib/queries/billing"
import {
  useCreateBrand,
  useDeleteBrand,
  useSetActiveBrand,
  useWorkspace,
} from "@/lib/queries/workspace"

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim()

export function BrandsSettings() {
  const { data, error, refetch } = useWorkspace()
  const billing = useBilling()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleting, setDeleting] = useState<Brand | null>(null)

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!data) return <ListSkeleton rows={5} />

  const allowance = billing.data?.subscription.brandAllowance ?? 1
  const atLimit = data.brands.length >= allowance
  const lockedCount = data.brands.filter((b) => b.locked).length

  return (
    <div className="space-y-4">
      <Panel
        title="Brands"
        action={
          <Button size="sm" variant="ink" disabled={atLimit} onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            Add brand
          </Button>
        }
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Each brand has its own connected social accounts. You&apos;re using {data.brands.length} of {allowance}{" "}
          on your plan.
          {atLimit ? (
            <>
              {" "}
              <ButtonLink href={routes.dashboard.billing} variant="link" className="h-auto p-0 text-sm">
                Upgrade for more
              </ButtonLink>
              .
            </>
          ) : null}
        </p>

        {lockedCount > 0 ? (
          <p className="mb-4 flex gap-2.5 rounded-2xl bg-amber-500/12 p-3 text-sm text-amber-800 dark:text-amber-200">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <span>
              {lockedCount} brand{lockedCount === 1 ? " is" : "s are"} locked because your plan includes {allowance}.
              Locked brands keep all their data and stay viewable, but can&apos;t be edited, posted from or
              connected until you upgrade.
            </span>
          </p>
        ) : null}

        {data.brands.length === 0 ? (
          <EmptyState
            icon={<Building2 />}
            title="No brands yet"
            description="Create a brand to connect networks and start posting."
            action={
              <Button size="sm" variant="ink" onClick={() => setCreateOpen(true)}>
                Add brand
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {data.brands.map((brand) => {
              const active = brand.id === data.activeBrandId
              return (
                <li key={brand.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-semibold text-ink-foreground">
                    {initials(brand.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {brand.name}
                      {active ? (
                        <span className="ml-2 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          Active
                        </span>
                      ) : null}
                      {brand.locked ? (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          <Lock className="size-3" />
                          Locked
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{brand.handle || "No handle"}</p>
                  </div>
                  <div className="flex w-full justify-end gap-2 sm:w-auto">
                    {brand.locked ? (
                      <ButtonLink href={routes.dashboard.billing} size="sm" variant="outline">
                        Upgrade to unlock
                      </ButtonLink>
                    ) : null}
                    {!active ? (
                      <SwitchBrandButton brandId={brand.id} name={brand.name} />
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => setDeleting(brand)}>
                      Delete
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <CreateBrandDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <DeleteBrandDialog brand={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}

function SwitchBrandButton({ brandId, name }: { brandId: string; name: string }) {
  const switchBrand = useSetActiveBrand()
  return (
    <Button
      size="sm"
      variant="ink"
      disabled={switchBrand.isPending}
      onClick={() =>
        switchBrand.mutate(brandId, { onSuccess: () => toast.success(`Switched to ${name}`) })
      }
    >
      Switch to
    </Button>
  )
}

function CreateBrandDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateBrand()

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const name = field(form, "name")
            create.mutate(
              {
                name,
                handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
                website: field(form, "website"),
                industry: field(form, "industry") || "other",
                timezone: field(form, "timezone") || "UTC",
              },
              {
                onSuccess: () => {
                  toast.success("Brand created")
                  onClose()
                },
              }
            )
          }}
        >
          <DialogHeader>
            <DialogTitle>Add brand</DialogTitle>
            <DialogDescription>Each brand gets its own connected accounts and content.</DialogDescription>
          </DialogHeader>
          <FormField id="new-brand-name" label="Brand name">
            <Input id="new-brand-name" name="name" required autoFocus placeholder="Acme Co" />
          </FormField>
          <FormField id="new-brand-website" label="Website" hint="Optional.">
            <Input id="new-brand-website" name="website" placeholder="https://" />
          </FormField>
          <FormField id="new-brand-industry" label="Industry">
            <select id="new-brand-industry" name="industry" className={selectClassName} defaultValue="other">
              {industries.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="new-brand-timezone" label="Timezone">
            <SearchableSelect
              id="new-brand-timezone"
              name="timezone"
              options={timezones}
              defaultValue="UTC"
              placeholder="Search timezones…"
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="ink" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteBrandDialog({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const remove = useDeleteBrand()
  return (
    <AlertDialog open={!!brand} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {brand?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Removes this brand&apos;s connected accounts, posts, and inbox. Other brands are unchanged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => {
              if (!brand) return
              remove.mutate(brand.id, {
                onSuccess: () => {
                  toast.success("Brand deleted")
                  onClose()
                },
              })
            }}
          >
            Delete brand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
