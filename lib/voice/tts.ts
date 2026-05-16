import { getAsianLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

function speechLang(code: SupportedLanguage): string {
  return getAsianLanguage(code)?.bcp47 ?? "en-US"
}

type SpeakCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

let activeAudio: HTMLAudioElement | null = null
let activeObjectUrl: string | null = null

function revokeActiveAudio() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ""
    activeAudio = null
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl)
    activeObjectUrl = null
  }
  window.speechSynthesis?.cancel()
}

export function pickVoiceForLanguage(
  language: SupportedLanguage
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null

  const voices = window.speechSynthesis.getVoices()
  const target = speechLang(language)
  const langPrefix = target.split("-")[0] ?? "en"

  const preferred =
    voices.find((v) => v.lang === target) ??
    voices.find((v) => v.lang.startsWith(langPrefix)) ??
    voices.find((v) => v.lang.startsWith("en"))

  return preferred ?? voices[0] ?? null
}

function speakWithBrowser(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    callbacks?.onError?.()
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = speechLang(language)
  utterance.rate = language === "en" ? 0.95 : 0.9
  utterance.pitch = 1

  const voice = pickVoiceForLanguage(language)
  if (voice) utterance.voice = voice

  utterance.onstart = () => callbacks?.onStart?.()
  utterance.onend = () => callbacks?.onEnd?.()
  utterance.onerror = () => callbacks?.onError?.()

  window.speechSynthesis.speak(utterance)
}

async function speakWithOpenAI(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks,
  signal?: AbortSignal
): Promise<boolean> {
  const res = await fetch("/api/voice/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
    signal,
  })

  if (!res.ok) return false

  const blob = await res.blob()
  if (!blob.size) return false

  revokeActiveAudio()
  activeObjectUrl = URL.createObjectURL(blob)
  activeAudio = new Audio(activeObjectUrl)

  return new Promise((resolve) => {
    if (!activeAudio) {
      resolve(false)
      return
    }

    const audio = activeAudio

    audio.onplay = () => callbacks?.onStart?.()
    audio.onended = () => {
      revokeActiveAudio()
      callbacks?.onEnd?.()
      resolve(true)
    }
    audio.onerror = () => {
      revokeActiveAudio()
      callbacks?.onError?.()
      resolve(false)
    }

    audio.play().catch(() => {
      revokeActiveAudio()
      callbacks?.onError?.()
      resolve(false)
    })
  })
}

/**
 * Speak text — OpenAI TTS first (natural voice), browser Speech Synthesis as fallback.
 */
export function speakText(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks
): () => void {
  if (typeof window === "undefined" || !text.trim()) {
    return () => {}
  }

  const controller = new AbortController()
  let cancelled = false

  const cancel = () => {
    cancelled = true
    controller.abort()
    stopSpeaking()
  }

  void (async () => {
    try {
      const ok = await speakWithOpenAI(
        text,
        language,
        {
          onStart: () => {
            if (!cancelled) callbacks?.onStart?.()
          },
          onEnd: () => {
            if (!cancelled) callbacks?.onEnd?.()
          },
          onError: () => {
            if (!cancelled) callbacks?.onError?.()
          },
        },
        controller.signal
      )

      if (cancelled) return

      if (!ok) {
        speakWithBrowser(text, language, callbacks)
      }
    } catch {
      if (!cancelled) {
        speakWithBrowser(text, language, callbacks)
      }
    }
  })()

  return cancel
}

export function stopSpeaking(): void {
  revokeActiveAudio()
}

/** Preload browser voices for fallback */
export function preloadVoices(): void {
  if (typeof window === "undefined") return
  window.speechSynthesis?.getVoices()
  window.speechSynthesis?.addEventListener("voiceschanged", () => {
    window.speechSynthesis?.getVoices()
  })
}
