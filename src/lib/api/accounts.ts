import type { NetworkId } from "@/config/networks"
import { http } from "@/lib/api/http"
import type { SocialAccount } from "@/lib/api/types"

export const accountsApi = {
  list: () => http.get<SocialAccount[]>("/accounts"),

  /** Returns the provider consent URL; the caller navigates the browser to it. */
  async oauthStart(network: NetworkId) {
    const { redirectUrl } = await http.get<{ redirectUrl: string }>(`/accounts/${network}/oauth/start`)
    return redirectUrl
  },

  reconnect: (network: NetworkId) => http.post<SocialAccount>(`/accounts/${network}/reconnect`),
  disconnect: (network: NetworkId) => http.delete<SocialAccount>(`/accounts/${network}`),
}
