"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { CreditCard, Link2, LogOut, Settings, Shield } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { routes } from "@/config/site"
import { authApi } from "@/lib/api/auth"
import { errorMessage } from "@/lib/api/errors"
import { setAccessToken, setActiveBrandId } from "@/lib/api/http"
import { initials } from "@/lib/format"
import { useWorkspace } from "@/lib/queries/workspace"

export function UserMenu() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data } = useWorkspace()
  const profile = data?.profile

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setAccessToken(null)
      setActiveBrandId(null)
      queryClient.clear()
      router.push(routes.login)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="ml-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff4d00,#ffb08a)] text-[11px] font-semibold text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {profile ? initials(profile.name) : ""}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <span className="block truncate text-sm font-semibold text-foreground">{profile?.name}</span>
            <span className="block truncate text-xs font-normal">{profile?.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-1.5" onClick={() => router.push(routes.dashboard.settings)}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="py-1.5" onClick={() => router.push(routes.dashboard.accounts)}>
          <Link2 />
          Connected accounts
        </DropdownMenuItem>
        <DropdownMenuItem className="py-1.5" onClick={() => router.push(routes.dashboard.billing)}>
          <CreditCard />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem className="py-1.5" onClick={() => window.open("/privacy", "_blank", "noopener,noreferrer")}>
          <Shield />
          Privacy policy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-1.5" variant="destructive" onClick={() => void logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
