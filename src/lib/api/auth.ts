import { http } from "@/lib/api/http"

export type SessionInfo = {
  userId: string
  profile: { name: string; email: string }
  workspace: { id: string; activeBrandId: string; brandCount: number }
}

export const authApi = {
  signup: (input: { name: string; email: string; password: string }) =>
    http.post<{ userId: string }>("/auth/signup", input, { allow401: true, noBrand: true }),
  login: (input: { email: string; password: string }) =>
    http.post<{ accessToken: string; userId: string }>("/auth/login", input, { allow401: true, noBrand: true }),
  logout: () => http.post<void>("/auth/logout", undefined, { allow401: true, noBrand: true }),
  forgotPassword: (email: string) => http.post<void>("/auth/forgot-password", { email }, { allow401: true, noBrand: true }),
  resetPassword: (input: { token: string; password: string }) =>
    http.post<void>("/auth/reset-password", input, { allow401: true, noBrand: true }),
  verifyEmail: (token: string) => http.post<void>("/auth/verify-email", { token }, { allow401: true, noBrand: true }),
  resendVerification: (email?: string) =>
    http.post<void>("/auth/resend-verification", { email }, { allow401: true, noBrand: true }),
  me: () => http.get<SessionInfo>("/auth/me", { noBrand: true }),
  contact: (input: { name: string; email: string; message: string }) =>
    http.post<void>("/contact", input, { allow401: true, noBrand: true }),
}
