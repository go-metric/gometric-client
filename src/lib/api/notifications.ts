import { read, write } from "@/lib/api/mock/db"

export const notificationsApi = {
  list() {
    return read((db) => [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  markRead(id: string) {
    return write((db) => {
      const n = db.notifications.find((item) => item.id === id)
      if (n) n.read = true
    })
  },

  markAllRead() {
    return write((db) => {
      for (const n of db.notifications) n.read = true
    })
  },
}
