"use client"

import { Search, Moon, Sun } from "lucide-react"
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
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
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-6"
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("header.search")}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2" data-no-translate>
        <LanguagePicker />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <NotificationDropdown />

        <Avatar className="h-8 w-8">
          <AvatarImage src={sessionUser?.photoURL ?? undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
