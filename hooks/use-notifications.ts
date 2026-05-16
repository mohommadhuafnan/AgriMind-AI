"use client"

import { useCallback, useEffect, useState } from "react"

export function useNotifications(pollMs = 30000) {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const json = await res.json()
      if (res.ok) {
        setNotifications(json.data?.notifications ?? [])
        setUnreadCount(json.data?.unreadCount ?? 0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, pollMs)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollMs])

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
    await fetchNotifications()
  }

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST" })
    await fetchNotifications()
  }

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh: fetchNotifications }
}
