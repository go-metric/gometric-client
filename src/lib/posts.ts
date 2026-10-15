import { networks, type NetworkId } from "@/config/networks"
import type { Post, PostInput } from "@/lib/api/types"

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
  if (input.status === "scheduled") {
    if (!input.scheduledAt) problems.push("Pick a date and time to schedule.")
    else if (new Date(input.scheduledAt) <= now) problems.push("Scheduled time must be in the future.")
  }
  return problems
}
