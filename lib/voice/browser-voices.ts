import { getAsianLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

/** BCP-47 tags to try (device-dependent) */
const LOCALE_CANDIDATES: Partial<Record<SupportedLanguage, string[]>> = {
  en: ["en-US", "en-GB", "en-IN", "en"],
  ta: ["ta-IN", "ta-LK", "ta-SG", "ta"],
  si: ["si-LK", "si"],
  hi: ["hi-IN", "hi"],
  km: ["km-KH", "km"],
  th: ["th-TH", "th"],
  vi: ["vi-VN", "vi"],
  id: ["id-ID", "id"],
  ms: ["ms-MY", "ms"],
  fil: ["fil-PH", "fil", "tl-PH", "tl"],
  zh: ["zh-CN", "zh-TW", "zh"],
  yue: ["yue-HK", "zh-HK", "yue"],
  ko: ["ko-KR", "ko"],
  ja: ["ja-JP", "ja"],
  sg: ["en-SG", "en"],
}

function localeCandidates(language: SupportedLanguage): string[] {
  const fromConfig = getAsianLanguage(language)?.bcp47
  const extras = LOCALE_CANDIDATES[language] ?? []
  const merged = [
    ...(fromConfig ? [fromConfig] : []),
    ...extras,
  ]
  return [...new Set(merged.map((l) => l.toLowerCase()))]
}

function langPrefix(locale: string): string {
  return locale.split("-")[0] ?? locale
}

function voiceMatchesLocale(voice: SpeechSynthesisVoice, locale: string): boolean {
  const v = voice.lang.toLowerCase().replace("_", "-")
  const target = locale.toLowerCase()
  return v === target || v.startsWith(`${target}-`) || v.startsWith(target)
}

function voiceMatchesLanguage(
  voice: SpeechSynthesisVoice,
  language: SupportedLanguage
): boolean {
  const candidates = localeCandidates(language)
  return candidates.some((loc) => voiceMatchesLocale(voice, loc))
}

function isEnglishVoice(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith("en")
}

export function speechLangTag(language: SupportedLanguage): string {
  return localeCandidates(language)[0] ?? "en-US"
}

export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([])
  }

  const synth = window.speechSynthesis
  let voices = synth.getVoices()
  if (voices.length > 0) return Promise.resolve(voices)

  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", onChange)
      resolve(synth.getVoices())
    }
    const onChange = () => {
      if (synth.getVoices().length > 0) done()
    }
    synth.addEventListener("voiceschanged", onChange)
    synth.getVoices()
    window.setTimeout(done, 1200)
  })
}

export function hasNativeBrowserVoice(
  voices: SpeechSynthesisVoice[],
  language: SupportedLanguage
): boolean {
  if (language === "en") return voices.some((v) => isEnglishVoice(v))
  return voices.some(
    (v) => voiceMatchesLanguage(v, language) && !isEnglishVoice(v)
  )
}

export function pickVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  language: SupportedLanguage
): SpeechSynthesisVoice | null {
  if (!voices.length) return null

  const candidates = localeCandidates(language)

  for (const locale of candidates) {
    const exact = voices.find((v) => voiceMatchesLocale(v, locale))
    if (exact) return exact
  }

  if (language !== "en") {
    const prefix = langPrefix(candidates[0] ?? language)
    const byPrefix = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith(prefix) && !isEnglishVoice(v)
    )
    const local = byPrefix.find((v) => v.localService)
    if (local) return local
    if (byPrefix[0]) return byPrefix[0]
  }

  if (language === "en") {
    return (
      voices.find((v) => v.lang === "en-US" && v.localService) ??
      voices.find((v) => isEnglishVoice(v)) ??
      null
    )
  }

  return null
}
