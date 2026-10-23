import { privacyPolicyHtml } from "@/lib/privacy-policy-html"

/**
 * Serve the privacy policy as plain HTML (not a Next.js RSC page).
 * Google OAuth verification scrapes this URL and rejects sparse/JS-heavy pages
 * as "insufficient content" even when a styled React page has the same text.
 */
export async function GET() {
  return new Response(privacyPolicyHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
