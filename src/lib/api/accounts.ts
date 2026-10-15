import type { NetworkId } from "@/config/networks"
import { ApiError } from "@/lib/api/errors"
import { nowIso, read, requireActiveBrandId, write } from "@/lib/api/mock/db"
import type { MockDb } from "@/lib/api/mock/seed"

function findAccount(db: MockDb, brandId: string, network: NetworkId) {
  const account = db.accounts.find((a) => a.brandId === brandId && a.network === network)
  if (!account) throw new ApiError("Unknown network for this brand.", 404)
  return account
}

export const accountsApi = {
  list() {
    return read((db) => {
      const brandId = db.workspace.activeBrandId
      return db.accounts.filter((a) => a.brandId === brandId)
    })
  },

  /**
   * Mock of the OAuth callback. The real flow redirects to the network's
   * consent screen and the service stores the token.
   */
  async connect(network: NetworkId, handle: string) {
    const trimmed = handle.trim()
    if (!trimmed) throw new ApiError("Enter the account handle.", 422)
    return write((db) => {
      const brandId = requireActiveBrandId(db)
      const account = findAccount(db, brandId, network)
      Object.assign(account, {
        status: "connected",
        handle: trimmed,
        followers: account.followers ?? 0,
        connectedAt: nowIso(),
      })
      return account
    })
  },

  reconnect(network: NetworkId) {
    return write((db) => {
      const brandId = requireActiveBrandId(db)
      const account = findAccount(db, brandId, network)
      if (account.status === "disconnected") throw new ApiError("Connect this account first.", 409)
      Object.assign(account, { status: "connected", connectedAt: nowIso() })
      return account
    })
  },

  disconnect(network: NetworkId) {
    return write((db) => {
      const brandId = requireActiveBrandId(db)
      const account = findAccount(db, brandId, network)
      Object.assign(account, { status: "disconnected", handle: null, followers: null, connectedAt: null })
      for (const post of db.posts) {
        if (post.brandId === brandId && post.status !== "published") {
          post.networks = post.networks.filter((n) => n !== network)
        }
      }
      return account
    })
  },
}
