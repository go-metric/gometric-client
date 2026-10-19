import { http } from "@/lib/api/http"
import type { Brand, NotificationPrefs, Profile, Workspace } from "@/lib/api/types"

export function activeBrand(workspace: Workspace): Brand | null {
  return workspace.brands.find((b) => b.id === workspace.activeBrandId) ?? workspace.brands[0] ?? null
}

export const workspaceApi = {
  get: () => http.get<Workspace>("/workspace", { noBrand: true }),
  createBrand: (input: Omit<Brand, "id">) => http.post<Workspace>("/workspace/brands", input, { noBrand: true }),
  updateBrand: (brandId: string, patch: Partial<Omit<Brand, "id">>) =>
    http.patch<Workspace>(`/workspace/brands/${brandId}`, patch, { noBrand: true }),
  deleteBrand: (brandId: string) => http.delete<Workspace>(`/workspace/brands/${brandId}`, { noBrand: true }),
  setActiveBrand: (brandId: string) => http.put<Workspace>("/workspace/active-brand", { brandId }, { noBrand: true }),
  updateProfile: (patch: Partial<Profile>) => http.patch<Workspace>("/workspace/profile", patch, { noBrand: true }),
  updateNotificationPrefs: (patch: Partial<NotificationPrefs>) =>
    http.patch<Workspace>("/workspace/notification-prefs", patch, { noBrand: true }),
}
