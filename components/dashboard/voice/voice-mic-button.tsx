"use client"

import { Mic, StopCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface VoiceMicButtonProps {
  isListening: boolean
  isProcessing: boolean
  audioLevel: number
  onClick: () => void
  size?: "default" | "large"
}

export function VoiceMicButton({
  isListening,
  isProcessing,
  audioLevel,
  onClick,
  size = "default",
}: VoiceMicButtonProps) {
  const isLarge = size === "large"
  const btnClass = isLarge ? "h-28 w-28" : "h-20 w-20"
  const iconClass = isLarge ? "h-12 w-12" : "h-8 w-8"

  return (
    <motion.div className="flex flex-col items-center gap-4">
      {isListening && (
        <div className={`flex items-center gap-1 ${isLarge ? "h-16" : "h-12"}`}>
          {Array.from({ length: isLarge ? 28 : 20 }).map((_, i) => (
            <motion.div
              key={i}
              className={`rounded-full bg-primary ${isLarge ? "w-1.5" : "w-1"}`}
              animate={{ height: [4, (audioLevel % 40) + (isLarge ? 16 : 8), 4] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={isProcessing}
        className={`relative flex ${btnClass} items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-60 ${
          isListening
            ? "scale-105 bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
            : "bg-primary text-primary-foreground hover:scale-105 ring-4 ring-primary/20"
        }`}
      >
        {isProcessing ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : isListening ? (
          <StopCircle className={iconClass} />
        ) : (
          <Mic className={iconClass} />
        )}
        {isListening && (
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
        )}
      </button>
    </motion.div>
  )
}
