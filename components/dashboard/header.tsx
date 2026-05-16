"use client"

import { Menu } from "lucide-react"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import { AnimatedSearchInput } from "@/components/dashboard/animated-search-input"
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown"
import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu"
import { LiveDateTime } from "@/components/dashboard/live-datetime"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

type DashboardHeaderProps = {
  onOpenMobileMenu?: () => void
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { language } = useLanguage()

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

        <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
          <LiveDateTime variant="compact" className="shrink-0 border-r border-border pr-4" />
          <AnimatedSearchInput className="max-w-lg flex-1" />
        </div>

        <div className="min-w-0 flex-1 lg:hidden">
          <AgriMindLogo size="xs" iconOnly href="/dashboard" />
          <LiveDateTime variant="compact" className="!mt-1 !block text-left" />
        </div>

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
