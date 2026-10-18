/** Module-level `/auth/me` cache — no imports, safe from circular deps. */

let sessionPromise: Promise<unknown> | null = null

export function invalidateAuthSession() {
  sessionPromise = null
}

export function getAuthSessionPromise<T>(): Promise<T> | null {
  return sessionPromise as Promise<T> | null
}

export function setAuthSessionPromise<T>(promise: Promise<T>) {
  sessionPromise = promise
  return promise
}
