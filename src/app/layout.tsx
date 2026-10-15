import type { Metadata } from "next"
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import { QueryProvider } from "@/components/providers/query-provider"
import { RouteProgress } from "@/components/route-progress"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
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

export const metadata: Metadata = {
  title: {
    default: "gometric — Plan, inbox, and analytics for social",
    template: "%s · gometric",
  },
  description:
    "Connect Instagram, TikTok, YouTube, Google Business, Facebook, X, LinkedIn, Threads, and Pinterest. Schedule posts, manage your inbox, and track analytics in one place.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jakarta.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <RouteProgress />
            {children}
            <Toaster position="bottom-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
