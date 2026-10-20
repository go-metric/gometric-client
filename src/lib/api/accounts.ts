import type { NetworkId } from "@/config/networks"
import { api } from "@/lib/api/http"
import type { SocialAccount, TikTokProfile, TikTokVideo } from "@/lib/api/types"

export const accountsApi = {
  list() {
    return api<SocialAccount[]>("/accounts")
  },

  /** Returns the provider consent URL; the service handles the callback and redirects back to settings. */
  async startOAuth(network: NetworkId) {
    const { redirectUrl } = await api<{ redirectUrl: string }>(`/accounts/${network}/oauth/start`)
    return redirectUrl
  },

  reconnect(network: NetworkId) {
    return api<SocialAccount>(`/accounts/${network}/reconnect`, { method: "POST" })
  },

  setPreferences(network: NetworkId, prefs: { inbox?: boolean; analytics?: boolean }) {
    return api<SocialAccount>(`/accounts/${network}/preferences`, { method: "PATCH", body: JSON.stringify(prefs) })
  },

  /** Live TikTok profile (Login Kit and Display API). */
  tiktokProfile() {
    return api<TikTokProfile>("/accounts/tiktok/profile")
  },

  /** The account's videos with their stats (Display API video.list). */
  tiktokVideos(maxCount = 12) {
    return api<{ handle: string | null; followers: number | null; scope: string | null; videos: TikTokVideo[] }>(`/accounts/tiktok/videos?maxCount=${maxCount}`)
  },

  disconnect(network: NetworkId) {
    return api<SocialAccount>(`/accounts/${network}`, { method: "DELETE" })
  },
}
