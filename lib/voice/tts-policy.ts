import type { SupportedLanguage } from "@/types"

export type SpeakStrategy = "instant" | "natural"

/** Farmer-facing languages that need server TTS (browser often has no native voice on Windows) */
const SERVER_TTS_LANGUAGES = new Set<SupportedLanguage>([
  "ta",
  "si",
  "hi",
  "km",
  "th",
  "vi",
  "id",
  "ms",
  "fil",
  "zh",
  "yue",
  "ko",
  "ja",
])

export function prefersServerTts(language: SupportedLanguage): boolean {
  return SERVER_TTS_LANGUAGES.has(language)
}

export function defaultSpeakStrategy(
  language: SupportedLanguage
): SpeakStrategy {
  return language === "en" ? "instant" : "natural"
}

/** OpenAI TTS pronunciation hint (gpt-4o-mini-tts) */
export function ttsInstructionsForLanguage(
  language: SupportedLanguage
): string | undefined {
  switch (language) {
    case "ta":
      return "Speak in Tamil (தமிழ்) with clear, natural pronunciation for farmers in Sri Lanka and India. Do not use English accent."
    case "si":
      return "Speak in Sinhala (සිංහල) with clear, natural Sri Lankan pronunciation. Do not use English accent."
    case "hi":
      return "Speak in Hindi (हिन्दी) with clear, natural Indian pronunciation. Do not use English accent."
    case "km":
      return "Speak in Khmer with clear, natural pronunciation."
    case "th":
      return "Speak in Thai with clear, natural pronunciation."
    case "vi":
      return "Speak in Vietnamese with clear, natural pronunciation."
    case "id":
      return "Speak in Indonesian with clear, natural pronunciation."
    case "ms":
      return "Speak in Malay with clear, natural pronunciation."
    case "fil":
      return "Speak in Filipino with clear, natural pronunciation."
    case "zh":
      return "Speak in Mandarin Chinese with clear, natural pronunciation."
    case "yue":
      return "Speak in Cantonese with clear, natural pronunciation."
    case "ko":
      return "Speak in Korean with clear, natural pronunciation."
    case "ja":
      return "Speak in Japanese with clear, natural pronunciation."
    default:
      return undefined
  }
}
