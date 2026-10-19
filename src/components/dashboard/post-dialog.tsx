"use client"

import { useState } from "react"
import { Copy, ExternalLink, Info, Pencil, RotateCw, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PostStatusBadge } from "@/components/dashboard/ui"
import { NetworkTile } from "@/components/network"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, ButtonLink } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { networks } from "@/config/networks"
import { routes } from "@/config/site"
import { useBrandTimeZone } from "@/hooks/use-brand-timezone"
import { errorMessage } from "@/lib/api/errors"
import type { DeliveryStatus, Post } from "@/lib/api/types"
import { captionFor, EDITABLE_STATUSES, postDate, postTitle } from "@/lib/posts"
import { useDeletePost, useDuplicatePost, usePostLogs, usePublishPost, useRemoveFromNetwork, useRetryPost } from "@/lib/queries/posts"
import { formatInZone, formatWhenInZone } from "@/lib/tz-format"
import { cn } from "@/lib/utils"

const deliveryLabels: Record<DeliveryStatus, { label: string; className: string }> = {
  pending: { label: "Waiting", className: "bg-violet-500/12 text-violet-700 dark:text-violet-300" },
  publishing: { label: "Publishing", className: "bg-violet-500/12 text-violet-700 dark:text-violet-300" },
  published: { label: "Published", className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  failed: { label: "Failed", className: "bg-red-500/12 text-red-700 dark:text-red-300" },
  deleted: { label: "Deleted", className: "bg-foreground/8 text-foreground/60" },
}

export function PostDialog({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [alsoOnNetworks, setAlsoOnNetworks] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const timeZone = useBrandTimeZone()
  const publish = usePublishPost()
  const duplicate = useDuplicatePost()
  const remove = useDeletePost()
  const retry = useRetryPost()
  const removeFromNetwork = useRemoveFromNetwork()
  const logs = usePostLogs(post?.id ?? null, showLogs)

  if (!post) return null
  const date = postDate(post)
  const editable = EDITABLE_STATUSES.includes(post.status)
  const failed = post.deliveries.filter((d) => d.status === "failed")
  const removable = post.deliveries.filter((d) => d.canRemove)
  const live = post.deliveries.filter((d) => d.status === "published")

  const reportOutcome = (saved: Post) => {
    if (saved.status === "published") toast.success("Published")
    else if (saved.status === "publishing") toast.info("Still publishing; a network is retrying automatically.")
    else toast.error(saved.status === "failed" ? "Publishing failed" : "Some networks still failed")
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <PostStatusBadge status={post.status} />
              <span className="text-xs text-muted-foreground">{date ? formatWhenInZone(date, timeZone) : "Not scheduled"}</span>
            </div>
            <DialogTitle className="pr-8 text-lg">{postTitle(post)}</DialogTitle>
            <DialogDescription className="sr-only">Post details</DialogDescription>
          </DialogHeader>

          <div className="max-h-[55svh] space-y-4 overflow-y-auto">
            {post.media.length ? (
              <div className="flex gap-2 overflow-x-auto">
                {post.media.map((m) =>
                  m.mimeType?.startsWith("video/") ? (
                    <video key={m.id} src={m.url} muted aria-label={m.name} className="size-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- uploaded media served by the API
                    <img key={m.id} src={m.url} alt={m.name} className="size-20 shrink-0 rounded-xl object-cover" />
                  )
                )}
              </div>
            ) : null}

            {post.networks.length === 0 ? (
              <p className="text-sm whitespace-pre-line">{post.body}</p>
            ) : (
              post.networks.map((n) => {
                const d = post.deliveries.find((x) => x.network === n)
                return (
                  <div key={n} className="flex gap-3">
                    <NetworkTile network={n} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        {networks[n].name}
                        {d ? <span className={cn("rounded-full px-2 py-0.5 text-[10px]", deliveryLabels[d.status].className)}>{deliveryLabels[d.status].label}</span> : null}
                        {d?.externalUrl ? (
                          <a href={d.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium underline underline-offset-2">
                            View <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-sm whitespace-pre-line text-foreground/80">{captionFor(post, n)}</p>
                      {d?.status === "failed" && d.error ? <p role="alert" className="mt-1 text-xs text-destructive">{d.error}</p> : null}
                      {d?.status === "pending" && d.error ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {d.error}
                          {d.nextAttemptAt ? ` Retrying ${formatInZone(d.nextAttemptAt, timeZone, "HH:mm")}.` : ""}
                        </p>
                      ) : null}
                      {d?.note ? (
                        <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                          <Info className="mt-0.5 size-3 shrink-0" />
                          {d.note}
                        </p>
                      ) : null}
                      {d?.canRemove ? (
                        <button
                          type="button"
                          disabled={removeFromNetwork.isPending}
                          onClick={() =>
                            removeFromNetwork.mutate(
                              { id: post.id, network: n },
                              {
                                onSuccess: () => toast.success(`Deleted from ${networks[n].name}`),
                                onError: (e) => toast.error(errorMessage(e)),
                              }
                            )
                          }
                          className="mt-1 cursor-pointer text-xs font-medium text-destructive underline underline-offset-2 disabled:opacity-50"
                        >
                          Delete from {networks[n].name}
                        </button>
                      ) : d?.status === "published" ? (
                        <p className="mt-1 text-[11px] text-muted-foreground">{networks[n].name}&apos;s API doesn&apos;t allow deleting; delete it in the app.</p>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}

            {failed.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                disabled={retry.isPending}
                onClick={() =>
                  retry.mutate({ id: post.id }, { onSuccess: reportOutcome, onError: (e) => toast.error(errorMessage(e)) })
                }
              >
                <RotateCw data-icon="inline-start" />
                {retry.isPending ? "Retrying…" : `Retry ${failed.length === 1 ? networks[failed[0]!.network].name : "failed networks"}`}
              </Button>
            ) : null}

            <div>
              <button type="button" onClick={() => setShowLogs((v) => !v)} className="cursor-pointer text-xs font-medium text-muted-foreground underline underline-offset-2">
                {showLogs ? "Hide publishing log" : "Show publishing log"}
              </button>
              {showLogs ? (
                <ul className="mt-2 space-y-1 rounded-xl bg-muted/50 p-3 text-xs" aria-label="Publishing log">
                  {logs.isLoading ? <li className="text-muted-foreground">Loading…</li> : null}
                  {logs.error ? <li className="text-destructive">{errorMessage(logs.error)}</li> : null}
                  {logs.data?.length === 0 ? <li className="text-muted-foreground">Nothing logged yet.</li> : null}
                  {logs.data?.map((l) => (
                    <li key={l.id} className="flex gap-2">
                      <span className="shrink-0 text-muted-foreground">{formatInZone(l.at, timeZone, "MMM d HH:mm")}</span>
                      <span>{l.message}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" className="text-destructive hover:text-destructive" disabled={post.status === "publishing"} onClick={() => setConfirmDelete(true)}>
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                disabled={duplicate.isPending}
                onClick={() =>
                  duplicate.mutate(post.id, {
                    onSuccess: () => {
                      toast.success("Duplicated as a draft")
                      onClose()
                    },
                  })
                }
              >
                <Copy data-icon="inline-start" />
                Duplicate
              </Button>
              {editable ? (
                <>
                  <Button
                    variant="outline"
                    disabled={publish.isPending}
                    onClick={() =>
                      publish.mutate(post.id, {
                        onSuccess: (saved) => {
                          reportOutcome(saved)
                          if (saved.status === "published") onClose()
                        },
                        onError: (e) => toast.error(errorMessage(e)),
                      })
                    }
                  >
                    <Send data-icon="inline-start" />
                    {publish.isPending ? "Publishing…" : post.status === "failed" ? "Publish again" : "Publish now"}
                  </Button>
                  <ButtonLink variant="ink" href={`${routes.dashboard.compose}?post=${post.id}`}>
                    <Pencil data-icon="inline-start" />
                    Edit
                  </ButtonLink>
                </>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              {live.length > 0
                ? "The record is removed from gometric. Posts already live on a network stay there unless you also delete them there."
                : "It won't be published. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {live.length > 0 ? (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={alsoOnNetworks}
                disabled={removable.length !== live.length}
                onChange={(e) => setAlsoOnNetworks(e.target.checked)}
              />
              <span>
                Also delete from the networks
                {removable.length !== live.length ? " (not possible: some networks don't allow deleting through their API)" : ""}
              </span>
            </label>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault()
                remove.mutate(
                  { id: post.id, platform: alsoOnNetworks && live.length > 0 },
                  {
                    onSuccess: () => {
                      toast.success("Post deleted")
                      setConfirmDelete(false)
                      onClose()
                    },
                    onError: (err) => toast.error(errorMessage(err)),
                  }
                )
              }}
            >
              {remove.isPending ? "Deleting…" : "Delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
