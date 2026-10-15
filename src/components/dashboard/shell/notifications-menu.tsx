"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatAgo } from "@/lib/format"
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/queries/notifications"
import { cn } from "@/lib/utils"

export function NotificationsMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: notifications = [], isPending } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
            className="relative"
          />
        }
      >
        <Bell />
        {unread ? <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-card" /> : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-0 rounded-2xl p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="xs" disabled={!unread} onClick={() => markAllRead.mutate(undefined)}>
            <CheckCheck data-icon="inline-start" />
            Mark all read
          </Button>
        </div>
        <ul className="max-h-96 overflow-y-auto p-1.5">
          {isPending ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</li>
          ) : notifications.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</li>
          ) : (
            notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!n.read) markRead.mutate(n.id)
                    setOpen(false)
                    router.push(n.href)
                  }}
                  className="flex w-full cursor-pointer gap-3 rounded-xl p-2.5 text-left hover:bg-muted"
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand")} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", !n.read && "font-semibold")}>{n.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{n.body}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatAgo(n.createdAt)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
