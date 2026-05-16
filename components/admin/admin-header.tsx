"use client"

import { useEffect, useState } from "react"
import { Bell, Search } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SessionUser } from "@/types"

export function AdminHeader() {
  const [admin, setAdmin] = useState<SessionUser | null>(null)

  useEffect(() => {
    fetch("/api/auth/admin/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAdmin(json.data)
      })
      .catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-lg sm:h-16 sm:px-6">
      <div className="relative hidden min-w-0 max-w-md flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search farmers, reports..." className="pl-10" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {admin?.displayName ?? "Admin"}
          </p>
          <p className="text-xs text-muted-foreground">
            {admin?.email ?? "admin@agrimind.ai"}
          </p>
        </div>
      </div>
    </header>
  )
}
