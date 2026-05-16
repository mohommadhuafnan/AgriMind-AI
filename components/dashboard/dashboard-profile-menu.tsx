"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  User,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export function DashboardProfileMenu() {
  const router = useRouter()
  const { sessionUser, signOut } = useAuth()
  const { profile, loading } = useProfile()
  const { t } = useLanguage()

  const displayName =
    String(profile?.displayName ?? sessionUser?.displayName ?? "Farmer") ||
    "Farmer"
  const email = String(profile?.email ?? sessionUser?.email ?? "—")
  const phone = String(profile?.phone ?? sessionUser?.phone ?? "")
  const district = String(profile?.district ?? sessionUser?.district ?? "")
  const photoURL =
    (profile?.photoURL as string | undefined) ?? sessionUser?.photoURL ?? undefined

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    await signOut()
    toast.success(t("auth.signedOut"))
    router.push("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 gap-2 rounded-full px-1.5 sm:px-2"
          data-no-translate
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src={photoURL} alt={displayName} />
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm font-medium lg:inline">
            {displayName.split(" ")[0]}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72"
        data-no-translate
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-11 w-11">
              <AvatarImage src={photoURL} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            Loading profile…
          </div>
        ) : (
          <div className="space-y-2 px-2 py-1.5 text-sm">
            {phone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{phone}</span>
              </p>
            )}
            {district && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{district}</span>
              </p>
            )}
            {email && email !== "—" && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{email}</span>
              </p>
            )}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            {t("nav.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-destructive focus:text-destructive"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
