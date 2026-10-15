"use client"

import { ErrorState, ListSkeleton, Panel } from "@/components/dashboard/ui"
import { Switch } from "@/components/ui/switch"
import type { NotificationPrefKey } from "@/lib/api/types"
import { useUpdateNotificationPrefs, useWorkspace } from "@/lib/queries/workspace"

const groups: { title: string; items: { key: NotificationPrefKey; label: string; body: string }[] }[] = [
  {
    title: "Inbox",
    items: [
      { key: "newDm", label: "New direct messages", body: "Email me when someone sends a DM." },
      { key: "newComment", label: "New comments", body: "A daily digest of comments on your posts." },
    ],
  },
  {
    title: "Publishing",
    items: [
      { key: "postPublished", label: "Post published", body: "Confirm when a scheduled post goes live." },
      { key: "postFailed", label: "Post failed", body: "Alert me immediately if a post can't be published." },
    ],
  },
  {
    title: "Accounts & reports",
    items: [
      { key: "connectionExpiring", label: "Connection expiring", body: "Remind me before a network connection expires." },
      { key: "weeklyReport", label: "Weekly report", body: "A Monday summary of last week's performance." },
    ],
  },
]

export function NotificationSettings() {
  const { data, error, refetch } = useWorkspace()
  const update = useUpdateNotificationPrefs()

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <Panel title="Email notifications">
      {!data ? (
        <ListSkeleton rows={6} />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</h3>
              <ul className="divide-y divide-border">
                {group.items.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-4 py-3.5">
                    <label htmlFor={item.key} className="min-w-0 cursor-pointer">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-sm text-muted-foreground">{item.body}</span>
                    </label>
                    <Switch
                      id={item.key}
                      checked={data.notificationPrefs[item.key]}
                      onCheckedChange={(checked) => update.mutate({ [item.key]: checked })}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Panel>
  )
}
