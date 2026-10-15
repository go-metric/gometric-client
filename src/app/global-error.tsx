"use client"

import { useEffect } from "react"
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import { ErrorView } from "@/components/error-view"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
})

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <title>Something went wrong · gometric</title>
        <ErrorView onRetry={retry} digest={error.digest} />
      </body>
    </html>
  )
}
