import { networks, type NetworkId } from "@/config/networks"
import type { Post, PostInput, SocialAccount } from "@/lib/api/types"

/** Statuses where nothing has gone out yet, so the post can still be edited, moved or sent. */
export const EDITABLE_STATUSES: Post["status"][] = ["draft", "scheduled", "failed"]

/** Why an account can't be posted to right now, or null when it can. Mirrors what the service enforces. */
export function publishBlocker(account: SocialAccount): string | null {
  if (account.status === "expired") return "Connection expired. Reconnect it in Settings → Accounts."
  const cap = account.capabilities?.publish
  if (!cap) return null
  if (cap.state === "unsupported") return cap.reason
  if (cap.state === "needs_reauthorization") return `Reconnect to grant publishing permission (${cap.missingScopes.join(", ")}).`
  return null
}

/** First line of the caption, used as the post's title in lists. */
export function postTitle(post: Pick<Post, "body">) {
  const first = post.body.split("\n").find((line) => line.trim())
  return first?.trim() || "Untitled post"
}

/** Caption body without the title line. */
export function postExcerpt(post: Pick<Post, "body">) {
  const [, ...rest] = post.body.split("\n")
  return rest.join(" ").trim()
}

/** When the post appears on the calendar. */
export function postDate(post: Pick<Post, "publishedAt" | "scheduledAt">) {
  return post.publishedAt ?? post.scheduledAt
}

export function captionFor(post: Pick<Post, "body" | "overrides">, network: NetworkId) {
  return post.overrides[network] ?? post.body
}

/** Human-readable problems that block saving; empty when the post is valid. */
export function validatePost(input: PostInput, now = new Date()): string[] {
  const problems: string[] = []
  const isDraft = input.status === "draft"

  if (!input.body.trim() && input.media.length === 0) {
    problems.push("Write a caption or add media.")
  }
  if (!isDraft && input.networks.length === 0) {
    problems.push("Choose at least one network.")
  }
  for (const id of input.networks) {
    const limit = networks[id].charLimit
    if (captionFor(input, id).length > limit) {
      problems.push(`${networks[id].name} captions are limited to ${limit.toLocaleString()} characters.`)
    }
  }
  // Instagram Graph publish requires at least one image URL in media[].
  if (!isDraft && input.networks.includes("instagram") && input.media.length === 0) {
    problems.push("Instagram posts need at least one image.")
  }
  if (input.status === "scheduled") {
    if (!input.scheduledAt) problems.push("Pick a date and time to schedule.")
    else if (new Date(input.scheduledAt) <= now) problems.push("Scheduled time must be in the future.")
  }
  return problems
}
