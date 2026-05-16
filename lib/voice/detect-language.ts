import { ASIAN_LANGUAGES, type SupportedLanguage } from "@/lib/i18n/languages"

type ScriptScore = { code: SupportedLanguage; score: number }

function scoreChar(codePoint: number): ScriptScore | null {
  if (codePoint >= 0x0b80 && codePoint <= 0x0bff) return { code: "ta", score: 1 }
  if (codePoint >= 0x0d80 && codePoint <= 0x0dff) return { code: "si", score: 1 }
  if (codePoint >= 0x0900 && codePoint <= 0x097f) return { code: "hi", score: 1 }
  if (codePoint >= 0x0e00 && codePoint <= 0x0e7f) return { code: "th", score: 1 }
  if (codePoint >= 0x1780 && codePoint <= 0x17ff) return { code: "km", score: 1 }
  if (
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0x3400 && codePoint <= 0x4dbf)
  ) {
    return { code: "zh", score: 1 }
  }
  if (codePoint >= 0x3040 && codePoint <= 0x30ff) return { code: "ja", score: 1 }
  if (codePoint >= 0xac00 && codePoint <= 0xd7af) return { code: "ko", score: 1 }
  if (codePoint < 0x0080) return { code: "en", score: 0.2 }
  return null
}

/** Fast local guess from Unicode script (Tamil, Sinhala, etc.) */
export function detectLanguageFromScript(
  text: string
): SupportedLanguage | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const totals = new Map<SupportedLanguage, number>()

  for (const char of trimmed) {
    const cp = char.codePointAt(0)
    if (cp === undefined) continue
    const hit = scoreChar(cp)
    if (!hit) continue
    totals.set(hit.code, (totals.get(hit.code) ?? 0) + hit.score)
  }

  let best: SupportedLanguage | null = null
  let bestScore = 0

  for (const [code, score] of totals) {
    if (code === "en") continue
    if (score > bestScore) {
      bestScore = score
      best = code
    }
  }

  if (best && bestScore >= 1) return best

  const latinOnly = /^[\x00-\x7F\s\d\p{P}]+$/u.test(trimmed)
  if (latinOnly) return "en"

  return null
}

export function normalizeDetectedLanguage(
  code: string | null | undefined
): SupportedLanguage {
  if (!code) return "en"
  const lower = code.toLowerCase()
  const byCode = ASIAN_LANGUAGES.find((l) => l.code === lower)
  return (byCode?.code as SupportedLanguage) ?? "en"
}

/** Client: detect language from user message (voice or typed) */
export async function detectUserLanguage(
  text: string
): Promise<SupportedLanguage> {
  const script = detectLanguageFromScript(text)
  if (script) return script

  try {
    const res = await fetch("/api/voice/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    const json = await res.json()
    if (res.ok && json.data?.language) {
      return json.data.language as SupportedLanguage
    }
  } catch {
    /* fallback */
  }

  return "en"
}
