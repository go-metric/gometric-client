import { api, setActiveBrandId } from "@/lib/api/http"
import type { Brand, NotificationPrefs, Profile, Workspace } from "@/lib/api/types"

export function activeBrand(workspace: Workspace): Brand | null {
  return workspace.brands.find((b) => b.id === workspace.activeBrandId) ?? workspace.brands[0] ?? null
}

function rememberBrand(workspace: Workspace) {
  setActiveBrandId(workspace.activeBrandId || null)
  return workspace
}

export const workspaceApi = {
  async get() {
    const workspace = await api<Workspace>("/workspace")
    return rememberBrand(workspace)
  },

  async createBrand(input: Omit<Brand, "id" | "locked">) {
    const workspace = await api<Workspace>("/workspace/brands", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        handle: input.handle,
        website: input.website,
        industry: input.industry,
        timezone: input.timezone,
      }),
    })
    return rememberBrand(workspace)
  },

  async updateBrand(brandId: string, patch: Partial<Omit<Brand, "id">>) {
    const workspace = await api<Workspace>(`/workspace/brands/${brandId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
    return rememberBrand(workspace)
  },

  async deleteBrand(brandId: string) {
    const workspace = await api<Workspace>(`/workspace/brands/${brandId}`, { method: "DELETE" })
    return rememberBrand(workspace)
  },

  async setActiveBrand(brandId: string) {
    const workspace = await api<Workspace>("/workspace/active-brand", {
      method: "PUT",
      body: JSON.stringify({ brandId }),
    })
    return rememberBrand(workspace)
  },

  async updateProfile(patch: Partial<Profile>) {
    const workspace = await api<Workspace>("/workspace/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
    return rememberBrand(workspace)
  },

  async updateNotificationPrefs(patch: Partial<NotificationPrefs>) {
    const workspace = await api<Workspace>("/workspace/notification-prefs", {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
    return rememberBrand(workspace)
  },
}
