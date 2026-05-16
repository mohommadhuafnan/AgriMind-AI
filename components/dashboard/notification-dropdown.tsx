"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet</p>
        ) : (
          notifications.slice(0, 8).map((n) => {
            const id = String(n._id)
            const read = Boolean(n.read)
            return (
              <DropdownMenuItem
                key={id}
                className="flex flex-col items-start gap-1 cursor-pointer p-3"
                onSelect={() => {
                  if (!read) markRead(id)
                }}
                asChild
              >
                <Link href={String(n.link ?? "/dashboard")}>
                  <span
                    className={`text-sm font-medium ${!read ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {String(n.title)}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {String(n.message)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(String(n.createdAt)), {
                      addSuffix: true,
                    })}
                  </span>
                </Link>
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
