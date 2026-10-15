"use client"

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { errorMessage } from "@/lib/api/errors"

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Skip the global error toast when the caller shows its own error UI. */
      silent?: boolean
    }
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    },
    mutationCache: new MutationCache({
      onError: (error, _vars, _context, mutation) => {
        if (!mutation.meta?.silent) toast.error(errorMessage(error))
      },
    }),
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  // Keep server requests isolated and preserve the browser cache across renders.
  if (typeof window === "undefined") return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  )
}
