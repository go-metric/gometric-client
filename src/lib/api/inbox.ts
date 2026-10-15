import { ApiError } from "@/lib/api/errors"
import { newId, nowIso, read, write } from "@/lib/api/mock/db"
import type { MockDb } from "@/lib/api/mock/seed"
import type { ConversationStatus } from "@/lib/api/types"

function findConversation(db: MockDb, id: string) {
  const conversation = db.conversations.find((c) => c.id === id)
  if (!conversation) throw new ApiError("This conversation no longer exists.", 404)
  return conversation
}

export const inboxApi = {
  list() {
    return read((db) => {
      const brandId = db.workspace.activeBrandId
      return db.conversations
        .filter((c) => c.brandId === brandId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    })
  },

  setUnread(id: string, unread: boolean) {
    return write((db) => {
      const conversation = findConversation(db, id)
      conversation.unread = unread
      return conversation
    })
  },

  setStatus(id: string, status: ConversationStatus) {
    return write((db) => {
      const conversation = findConversation(db, id)
      conversation.status = status
      conversation.unread = false
      return conversation
    })
  },

  async reply(id: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed) throw new ApiError("Write a reply first.", 422)
    return write((db) => {
      const conversation = findConversation(db, id)
      const sentAt = nowIso()
      conversation.messages.push({ id: newId(), from: "brand", text: trimmed, sentAt })
      Object.assign(conversation, { updatedAt: sentAt, unread: false, status: "open" })
      return conversation
    })
  },
}
