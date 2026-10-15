import { ApiError } from "@/lib/api/errors"
import { newId, nowIso, read, requireActiveBrandId, write } from "@/lib/api/mock/db"
import type { MockDb } from "@/lib/api/mock/seed"
import type { Post, PostInput, PostListParams } from "@/lib/api/types"
import { postDate, postTitle, validatePost } from "@/lib/posts"

function findPost(db: MockDb, id: string) {
  const brandId = requireActiveBrandId(db)
  const post = db.posts.find((p) => p.id === id && p.brandId === brandId)
  if (!post) throw new ApiError("This post no longer exists.", 404)
  return post
}

function assertValid(input: PostInput) {
  const [problem] = validatePost(input)
  if (problem) throw new ApiError(problem, 422)
}

function notifyPublished(db: MockDb, post: Post) {
  if (!db.workspace.notificationPrefs.postPublished) return
  db.notifications.unshift({
    id: newId(),
    title: "Post published",
    body: postTitle(post),
    href: "/dashboard/planner",
    createdAt: nowIso(),
    read: false,
  })
}

export const postsApi = {
  list(params: PostListParams = {}) {
    return read((db) => {
      const brandId = db.workspace.activeBrandId
      return db.posts
        .filter((p) => {
          if (p.brandId !== brandId) return false
          if (params.status && p.status !== params.status) return false
          const date = postDate(p)
          if (params.from && (!date || date < params.from)) return false
          if (params.to && (!date || date > params.to)) return false
          return true
        })
        .sort((a, b) => (postDate(a) ?? a.createdAt).localeCompare(postDate(b) ?? b.createdAt))
    })
  },

  get(id: string) {
    return read((db) => findPost(db, id))
  },

  async create(input: PostInput) {
    assertValid(input)
    return write((db) => {
      const brandId = requireActiveBrandId(db)
      const now = nowIso()
      const post: Post = {
        ...input,
        id: newId(),
        brandId,
        publishedAt: input.status === "published" ? now : null,
        scheduledAt: input.status === "published" ? now : input.scheduledAt,
        createdAt: now,
        updatedAt: now,
      }
      db.posts.push(post)
      if (post.status === "published") notifyPublished(db, post)
      return post
    })
  },

  update(id: string, patch: Partial<PostInput>) {
    return write((db) => {
      const post = findPost(db, id)
      if (post.status === "published") throw new ApiError("Published posts can't be edited.", 409)
      const next = { ...post, ...patch }
      assertValid(next)
      const now = nowIso()
      if (next.status === "published") {
        next.publishedAt = now
        next.scheduledAt = now
        notifyPublished(db, next)
      }
      Object.assign(post, next, { updatedAt: now })
      return post
    })
  },

  /** Moves a scheduled or draft post to a new time; used by planner drag-and-drop. */
  reschedule(id: string, scheduledAt: string) {
    return write((db) => {
      const post = findPost(db, id)
      if (post.status === "published") throw new ApiError("Published posts can't be moved.", 409)
      if (new Date(scheduledAt) <= new Date()) throw new ApiError("Pick a time in the future.", 422)
      post.scheduledAt = scheduledAt
      post.updatedAt = nowIso()
      return post
    })
  },

  publishNow(id: string) {
    return write((db) => {
      const post = findPost(db, id)
      if (post.networks.length === 0) throw new ApiError("Choose at least one network first.", 422)
      const now = nowIso()
      Object.assign(post, { status: "published", publishedAt: now, scheduledAt: now, updatedAt: now })
      notifyPublished(db, post)
      return post
    })
  },

  duplicate(id: string) {
    return write((db) => {
      const source = findPost(db, id)
      const now = nowIso()
      const copy: Post = {
        ...structuredClone(source),
        id: newId(),
        status: "draft",
        scheduledAt: null,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      db.posts.push(copy)
      return copy
    })
  },

  remove(id: string) {
    return write((db) => {
      findPost(db, id)
      db.posts = db.posts.filter((p) => p.id !== id)
    })
  },
}
