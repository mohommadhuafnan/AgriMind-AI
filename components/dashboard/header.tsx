"use client"

import { Search, Menu } from "lucide-react"
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown"
import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu"
import { LiveDateTime } from "@/components/dashboard/live-datetime"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"

type DashboardHeaderProps = {
  onOpenMobileMenu?: () => void
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { t, language } = useLanguage()

  return (
    <header
      key={language}
      data-no-translate
      className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-5 lg:px-6">
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

        <div className="min-w-0 flex-1">
          <div className="relative mx-auto hidden max-w-md lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("header.search")}
              className="h-10 border-0 bg-muted/60 pl-9"
            />
          </div>
          <p className="truncate text-sm font-semibold text-foreground lg:hidden">
            AgriMind AI
          </p>
        </div>

        <LiveDateTime variant="compact" className="shrink-0" />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div className="hidden sm:block">
            <LanguagePicker />
          </div>
          <ThemeToggle />
          <NotificationDropdown />
          <DashboardProfileMenu />
        </div>
      </div>
    </header>
  )
}
