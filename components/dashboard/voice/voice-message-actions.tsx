"use client"

import { Volume2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface VoiceMessageActionsProps {
  content: string
  onSpeak: () => void
  isSpeaking?: boolean
}

export function VoiceMessageActions({
  content,
  onSpeak,
  isSpeaking,
}: VoiceMessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success("Copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-2 flex gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={onSpeak}
        disabled={isSpeaking}
      >
        <Volume2 className="h-3.5 w-3.5" />
        {isSpeaking ? "Playing…" : "Listen"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        Copy
      </Button>
    </div>
  )
}
