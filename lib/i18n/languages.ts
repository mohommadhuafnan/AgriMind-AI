/**
 * Asian languages supported via Valsea (https://valsea.ai)
 * API expects lowercase language names: english, tamil, mandarin, etc.
 */
export type LanguageRegion =
  | "default"
  | "south_asia"
  | "southeast_asia"
  | "east_asia"

export interface AsianLanguage {
  code: string
  label: string
  nativeLabel: string
  region: LanguageRegion
  /** Valsea translation / transcription target name */
  valsea: string
  /** BCP-47 for browser speech synthesis fallback */
  bcp47?: string
}

export const ASIAN_LANGUAGES: readonly AsianLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English", region: "default", valsea: "english", bcp47: "en-US" },
  { code: "si", label: "Sinhala", nativeLabel: "සිංහල", region: "south_asia", valsea: "sinhala", bcp47: "si-LK" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", region: "south_asia", valsea: "tamil", bcp47: "ta-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", region: "south_asia", valsea: "hindi", bcp47: "hi-IN" },
  { code: "km", label: "Khmer", nativeLabel: "ខ្មែរ", region: "southeast_asia", valsea: "khmer", bcp47: "km-KH" },
  { code: "ms", label: "Malay", nativeLabel: "Bahasa Melayu", region: "southeast_asia", valsea: "malay", bcp47: "ms-MY" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", region: "southeast_asia", valsea: "indonesian", bcp47: "id-ID" },
  { code: "th", label: "Thai", nativeLabel: "ไทย", region: "southeast_asia", valsea: "thai", bcp47: "th-TH" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", region: "southeast_asia", valsea: "vietnamese", bcp47: "vi-VN" },
  { code: "fil", label: "Filipino", nativeLabel: "Filipino", region: "southeast_asia", valsea: "filipino", bcp47: "fil-PH" },
  { code: "sg", label: "Singlish", nativeLabel: "Singlish", region: "southeast_asia", valsea: "singlish", bcp47: "en-SG" },
  { code: "zh", label: "Mandarin", nativeLabel: "中文", region: "east_asia", valsea: "chinese", bcp47: "zh-CN" },
  { code: "yue", label: "Cantonese", nativeLabel: "粵語", region: "east_asia", valsea: "cantonese", bcp47: "yue-HK" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", region: "east_asia", valsea: "korean", bcp47: "ko-KR" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", region: "east_asia", valsea: "japanese", bcp47: "ja-JP" },
] as const

export type SupportedLanguage = (typeof ASIAN_LANGUAGES)[number]["code"]

/** Voice UI: let VALSEA detect spoken language automatically */
export const AUTO_DETECT_LANGUAGE = "auto" as const
export type VoiceLanguagePreference =
  | SupportedLanguage
  | typeof AUTO_DETECT_LANGUAGE

export function isAutoDetectLanguage(
  value: string
): value is typeof AUTO_DETECT_LANGUAGE {
  return value === AUTO_DETECT_LANGUAGE
}

export const SUPPORTED_LANGUAGE_CODES: SupportedLanguage[] = ASIAN_LANGUAGES.map(
  (l) => l.code as SupportedLanguage
)

export const LANGUAGE_REGION_LABELS: Record<LanguageRegion, string> = {
  default: "Default",
  south_asia: "South Asia",
  southeast_asia: "Southeast Asia",
  east_asia: "East Asia",
}

const byCode = new Map(ASIAN_LANGUAGES.map((l) => [l.code, l]))

export function getAsianLanguage(code: string): AsianLanguage | undefined {
  return byCode.get(code)
}

export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return byCode.has(code)
}

export function toValseaLanguageName(code: string): string {
  return getAsianLanguage(code)?.valsea ?? code
}

/**
 * Use VALSEA.ai speech-to-text (not browser Web Speech).
 * Browser STT is unreliable for Tamil, Sinhala, Hindi, etc.; English can use the browser.
 */
export function prefersValseaVoiceTranscription(
  code: VoiceLanguagePreference | string
): boolean {
  if (code === AUTO_DETECT_LANGUAGE || code === "auto") return true
  if (code === "en") return false
  return isSupportedLanguage(code)
}

export function fromValseaLanguageName(name?: string): SupportedLanguage | null {
  if (!name?.trim()) return null
  const key = name.toLowerCase().trim()
  const match = ASIAN_LANGUAGES.find(
    (l) =>
      l.valsea === key ||
      l.code === key ||
      l.label.toLowerCase() === key ||
      l.nativeLabel.toLowerCase() === key
  )
  return match ? (match.code as SupportedLanguage) : null
}

export function getLanguageDisplayLabel(code: string): string {
  const lang = getAsianLanguage(code)
  if (!lang) return code
  return lang.nativeLabel !== lang.label
    ? `${lang.nativeLabel}`
    : lang.label
}

/** Dropdown list grouped by region (for header / landing) */
export function getLanguagesByRegion(): {
  region: LanguageRegion
  label: string
  languages: AsianLanguage[]
}[] {
  const regions: LanguageRegion[] = [
    "default",
    "south_asia",
    "southeast_asia",
    "east_asia",
  ]
  return regions.map((region) => ({
    region,
    label: LANGUAGE_REGION_LABELS[region],
    languages: ASIAN_LANGUAGES.filter((l) => l.region === region),
  }))
}
