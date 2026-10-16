import type { NetworkId } from "@/config/networks"
import { api } from "@/lib/api/http"
import type { SocialAccount } from "@/lib/api/types"

export const accountsApi = {
  list() {
    return api<SocialAccount[]>("/accounts")
  },

  /** Starts OAuth (mock provider on the service → redirects back to accounts settings). */
  async startOAuth(network: NetworkId) {
    const { redirectUrl } = await api<{ redirectUrl: string }>(`/accounts/${network}/oauth/start`)
    return redirectUrl
  },

  reconnect(network: NetworkId) {
    return api<SocialAccount>(`/accounts/${network}/reconnect`, { method: "POST" })
  },

  disconnect(network: NetworkId) {
    return api<SocialAccount>(`/accounts/${network}`, { method: "DELETE" })
  },
}
