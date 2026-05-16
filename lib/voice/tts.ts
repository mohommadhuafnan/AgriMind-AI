import { getAsianLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

const MAX_TTS_CHARS = 4096

function speechLang(code: SupportedLanguage): string {
  return getAsianLanguage(code)?.bcp47 ?? "en-US"
}

function truncateForTts(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TTS_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_TTS_CHARS - 1)}…`
}

function ttsCacheKey(text: string, language: SupportedLanguage): string {
  return `${language}:${truncateForTts(text)}`
}

type SpeakCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

type TtsCacheEntry = {
  key: string
  objectUrl: string
}

let activeAudio: HTMLAudioElement | null = null
let activeObjectUrl: string | null = null
let ttsCache: TtsCacheEntry | null = null
let ttsInflight: { key: string; promise: Promise<TtsCacheEntry | null> } | null =
  null

function revokeActiveAudio() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ""
    activeAudio = null
  }
  if (
    activeObjectUrl &&
    activeObjectUrl !== ttsCache?.objectUrl
  ) {
    URL.revokeObjectURL(activeObjectUrl)
  }
  activeObjectUrl = null
  window.speechSynthesis?.cancel()
}

function clearTtsCache() {
  if (ttsCache) {
    URL.revokeObjectURL(ttsCache.objectUrl)
    ttsCache = null
  }
}

async function fetchTtsBlob(
  text: string,
  language: SupportedLanguage,
  signal?: AbortSignal
): Promise<Blob | null> {
  const res = await fetch("/api/voice/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: truncateForTts(text), language }),
    signal,
  })
  if (!res.ok) return null
  const blob = await res.blob()
  return blob.size > 0 ? blob : null
}

async function loadTtsCache(
  text: string,
  language: SupportedLanguage,
  signal?: AbortSignal
): Promise<TtsCacheEntry | null> {
  const key = ttsCacheKey(text, language)
  if (ttsCache?.key === key) return ttsCache

  if (ttsInflight?.key === key) {
    return ttsInflight.promise
  }

  const promise = (async () => {
    const blob = await fetchTtsBlob(text, language, signal)
    if (!blob) return null
    clearTtsCache()
    const entry: TtsCacheEntry = {
      key,
      objectUrl: URL.createObjectURL(blob),
    }
    ttsCache = entry
    return entry
  })()

  ttsInflight = { key, promise }
  try {
    return await promise
  } finally {
    if (ttsInflight?.key === key) ttsInflight = null
  }
}

/** Start loading voice audio while the reply is still finishing */
export function prefetchSpeech(
  text: string,
  language: SupportedLanguage
): void {
  if (typeof window === "undefined" || !text.trim()) return
  const key = ttsCacheKey(text, language)
  if (ttsCache?.key === key || ttsInflight?.key === key) return
  void loadTtsCache(text, language)
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
  const utterance = new SpeechSynthesisUtterance(truncateForTts(text))
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

function playAudioUrl(
  url: string,
  callbacks?: SpeakCallbacks,
  ownsBlobUrl = true
): Promise<boolean> {
  revokeActiveAudio()
  if (ownsBlobUrl) {
    activeObjectUrl = url
  }
  activeAudio = new Audio(url)

  return new Promise((resolve) => {
    if (!activeAudio) {
      resolve(false)
      return
    }

    const audio = activeAudio

    const cleanup = () => {
      if (activeAudio === audio) {
        activeAudio.pause()
        activeAudio = null
      }
      if (ownsBlobUrl && activeObjectUrl === url) {
        URL.revokeObjectURL(url)
        activeObjectUrl = null
      }
    }

    audio.onplay = () => callbacks?.onStart?.()
    audio.onended = () => {
      cleanup()
      callbacks?.onEnd?.()
      resolve(true)
    }
    audio.onerror = () => {
      cleanup()
      callbacks?.onError?.()
      resolve(false)
    }

    audio.play().catch(() => {
      cleanup()
      callbacks?.onError?.()
      resolve(false)
    })
  })
}

async function speakWithOpenAI(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks,
  signal?: AbortSignal
): Promise<boolean> {
  const cached = await loadTtsCache(text, language, signal)
  if (cached) {
    return playAudioUrl(cached.objectUrl, callbacks, false)
  }

  const blob = await fetchTtsBlob(text, language, signal)
  if (!blob) return false

  const url = URL.createObjectURL(blob)
  return playAudioUrl(url, callbacks, true)
}

/**
 * Speak text — uses prefetched audio when available for faster playback.
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
