"use client"

import { useState } from "react"
import { Copy, Pencil, Send, Trash2 } from "lucide-react"
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
import type { Post } from "@/lib/api/types"
import { formatWhen } from "@/lib/format"
import { captionFor, postDate, postTitle } from "@/lib/posts"
import { useDeletePost, useDuplicatePost, usePublishPost } from "@/lib/queries/posts"

export function PostDialog({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const publish = usePublishPost()
  const duplicate = useDuplicatePost()
  const remove = useDeletePost()

  if (!post) return null
  const date = postDate(post)
  const editable = post.status !== "published"

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <PostStatusBadge status={post.status} />
              <span className="text-xs text-muted-foreground">{date ? formatWhen(date) : "Not scheduled"}</span>
            </div>
            <DialogTitle className="pr-8 text-lg">{postTitle(post)}</DialogTitle>
            <DialogDescription className="sr-only">Post details</DialogDescription>
          </DialogHeader>

          <div className="max-h-[50svh] space-y-4 overflow-y-auto">
            {post.media.length ? (
              <div className="flex gap-2 overflow-x-auto">
                {post.media.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URLs
                  <img key={m.id} src={m.url} alt={m.name} className="size-20 shrink-0 rounded-xl object-cover" />
                ))}
              </div>
            ) : null}
            {post.networks.length === 0 ? (
              <p className="text-sm whitespace-pre-line">{post.body}</p>
            ) : (
              post.networks.map((n) => (
                <div key={n} className="flex gap-3">
                  <NetworkTile network={n} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{networks[n].name}</p>
                    <p className="mt-0.5 text-sm whitespace-pre-line text-foreground/80">{captionFor(post, n)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
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
                        onSuccess: () => {
                          toast.success("Published")
                          onClose()
                        },
                      })
                    }
                  >
                    <Send data-icon="inline-start" />
                    Publish now
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
              {post.status === "published"
                ? "It will be removed from gometric. Posts already live on a network stay there."
                : "It won't be published. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(post.id, {
                  onSuccess: () => {
                    toast.success("Post deleted")
                    setConfirmDelete(false)
                    onClose()
                  },
                })
              }
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
