import { api, setAccessToken } from "@/lib/api/http"
import { invalidateAuthSession } from "@/lib/session-cache"

export type AuthMe = {
  userId: string
  profile: { name: string; email: string }
  workspace: {
    id: string
    activeBrandId: string
    brandCount: number
  }
}

export type LoginResult = {
  accessToken: string
  userId: string
}

export type LoginInput = {
  email: string
  password: string
  /** Persist token in localStorage when true. */
  remember?: boolean
}

export const authApi = {
  signup(body: { name: string; email: string; password: string }) {
    return api<{ userId: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuthRedirect: true,
    })
  },

  async login({ email, password, remember = false }: LoginInput) {
    const result = await api<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuthRedirect: true,
    })
    setAccessToken(result.accessToken, { remember })
    invalidateAuthSession()
    return result
  },

  async logout() {
    try {
      await api<void>("/auth/logout", { method: "POST", skipAuthRedirect: true })
    } finally {
      setAccessToken(null)
      invalidateAuthSession()
    }
  },

  forgotPassword(email: string) {
    return api<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuthRedirect: true,
    })
  },

  resetPassword(token: string, password: string) {
    return api<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      skipAuthRedirect: true,
    })
  },

  verifyEmail(token: string) {
    return api<void>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuthRedirect: true,
    })
  },

  resendVerification(email?: string) {
    return api<void>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(email ? { email } : {}),
      skipAuthRedirect: true,
    })
  },

  me(options?: { skipAuthRedirect?: boolean }) {
    return api<AuthMe>("/auth/me", { skipAuthRedirect: options?.skipAuthRedirect })
  },
}
