"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

export function useAiChat(language: SupportedLanguage = "en") {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (
      message: string,
      history: ChatMessageInput[] = []
    ): Promise<string | null> => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, language, history }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to get AI response")
        }
        return json.data?.reply ?? null
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "AI request failed"
        )
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [language]
  )

  const diagnoseCrop = useCallback(
    async (params: {
      imageBase64: string
      cropType: string
      description?: string
    }) => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/ai/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...params, language }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error ?? "Diagnosis failed")
        }
        return json.data
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Diagnosis failed"
        )
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [language]
  )

  return { sendMessage, diagnoseCrop, isLoading }
}
