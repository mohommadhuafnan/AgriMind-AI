import { getAsianLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

export type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
  }
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)
}

export function createSpeechRecognition(): BrowserSpeechRecognition | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
  }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

export function speechLangForCode(code: SupportedLanguage | string): string {
  return getAsianLanguage(code)?.bcp47 ?? "en-US"
}

export function joinSpokenText(base: string, addition: string): string {
  const a = base.trim()
  const b = addition.trim()
  if (!b) return a
  if (!a) return b
  return `${a} ${b}`
}
