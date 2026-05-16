"use client"

import { Search, Menu } from "lucide-react"
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"

type DashboardHeaderProps = {
  onOpenMobileMenu?: () => void
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { sessionUser } = useAuth()
  const { t, language } = useLanguage()

  const initials =
    sessionUser?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AM"

  return (
    <header
      key={language}
      data-no-translate
      className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:h-16 sm:gap-4 sm:px-6"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onOpenMobileMenu}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1 max-w-md">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("header.search")}
            className="border-0 bg-muted/50 pl-9"
          />
        </div>
        <p className="truncate text-sm font-semibold text-foreground sm:hidden">
          AgriMind AI
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <LanguagePicker />
        </div>
        <ThemeToggle />
        <NotificationDropdown />
        <Avatar className="h-8 w-8">
          <AvatarImage src={sessionUser?.photoURL ?? undefined} />
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
