import { ApiError } from "@/lib/api/errors"
import { assertBrandUnlocked, newId, read, resetDemoData, write } from "@/lib/api/mock/db"
import { disconnectedAccountsForBrand } from "@/lib/api/mock/seed"
import type { Brand, NotificationPrefs, Profile, Workspace } from "@/lib/api/types"
import { isValidEmail } from "@/lib/validation"

export function activeBrand(workspace: Workspace): Brand | null {
  return workspace.brands.find((b) => b.id === workspace.activeBrandId) ?? workspace.brands[0] ?? null
}

export const workspaceApi = {
  get() {
    return read((db) => db.workspace)
  },

  async createBrand(input: Omit<Brand, "id">) {
    if (!input.name.trim()) throw new ApiError("Brand name is required.", 422)
    return write((db) => {
      const allowance = db.billing.subscription.brandAllowance
      if (db.workspace.brands.length >= allowance) {
        throw new ApiError(`Your plan allows ${allowance} brand${allowance === 1 ? "" : "s"}. Upgrade to add more.`, 403)
      }
      const brand: Brand = {
        id: newId(),
        name: input.name.trim(),
        handle: input.handle.trim(),
        website: input.website.trim(),
        industry: input.industry,
        timezone: input.timezone,
      }
      db.workspace.brands.push(brand)
      db.workspace.activeBrandId = brand.id
      db.accounts.push(...disconnectedAccountsForBrand(brand.id))
      return db.workspace
    })
  },

  async updateBrand(brandId: string, patch: Partial<Omit<Brand, "id">>) {
    if (patch.name !== undefined && !patch.name.trim()) throw new ApiError("Brand name is required.", 422)
    return write((db) => {
      const brand = db.workspace.brands.find((b) => b.id === brandId)
      if (!brand) throw new ApiError("Brand not found.", 404)
      assertBrandUnlocked(db, brandId)
      Object.assign(brand, {
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.handle !== undefined ? { handle: patch.handle.trim() } : {}),
        ...(patch.website !== undefined ? { website: patch.website.trim() } : {}),
        ...(patch.industry !== undefined ? { industry: patch.industry } : {}),
        ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
      })
      return db.workspace
    })
  },

  async deleteBrand(brandId: string) {
    return write((db) => {
      const brands = db.workspace.brands
      if (!brands.some((b) => b.id === brandId)) throw new ApiError("Brand not found.", 404)
      db.workspace.brands = brands.filter((b) => b.id !== brandId)
      db.accounts = db.accounts.filter((a) => a.brandId !== brandId)
      db.posts = db.posts.filter((p) => p.brandId !== brandId)
      db.conversations = db.conversations.filter((c) => c.brandId !== brandId)
      if (db.workspace.activeBrandId === brandId) {
        db.workspace.activeBrandId = (db.workspace.brands.find((b) => !b.locked) ?? db.workspace.brands[0])?.id ?? ""
      }
      // Deleting the only usable brand must not leave the workspace fully locked.
      const remaining = db.workspace.brands
      if (remaining.length > 0 && remaining.every((b) => b.locked)) {
        const next = remaining.find((b) => b.id === db.workspace.activeBrandId) ?? remaining[0]
        delete next.locked
        db.workspace.activeBrandId = next.id
      }
      return db.workspace
    })
  },

  async setActiveBrand(brandId: string) {
    return write((db) => {
      if (!db.workspace.brands.some((b) => b.id === brandId)) throw new ApiError("Brand not found.", 404)
      db.workspace.activeBrandId = brandId
      return db.workspace
    })
  },

  async updateProfile(patch: Partial<Profile>) {
    if (patch.name !== undefined && !patch.name.trim()) throw new ApiError("Name is required.", 422)
    if (patch.email !== undefined && !isValidEmail(patch.email)) {
      throw new ApiError("Enter a valid email address.", 422)
    }
    return write((db) => {
      Object.assign(db.workspace.profile, patch)
      return db.workspace
    })
  },

  updateNotificationPrefs(patch: Partial<NotificationPrefs>) {
    return write((db) => {
      Object.assign(db.workspace.notificationPrefs, patch)
      return db.workspace
    })
  },

  /** Dev/demo only: wipe localStorage and reseed. Not part of the real service. */
  resetDemo() {
    return resetDemoData()
  },
}
