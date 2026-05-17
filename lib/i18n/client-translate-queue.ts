import type { SupportedLanguage } from "@/lib/i18n/languages"
import {
  LIVE_TRANSLATE_CHUNK_SIZE,
  LIVE_TRANSLATE_MIN_INTERVAL_MS,
} from "@/lib/i18n/translation-policy"

let lastLiveBatchAt = 0

export function canRunLiveTranslation(): boolean {
  return Date.now() - lastLiveBatchAt >= LIVE_TRANSLATE_MIN_INTERVAL_MS
}

export function markLiveTranslationRan() {
  lastLiveBatchAt = Date.now()
}

async function fetchLiveChunk(
  texts: string[],
  target: SupportedLanguage
): Promise<string[]> {
  const res = await fetch("/api/valsea/translate-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target, source: "en", mode: "live" }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? "Translation failed")
  }
  return (json.data?.translations as string[]) ?? texts
}

/** Rate-limited live translation for diagnosis / dynamic AI content only. */
export async function fetchLiveTranslations(
  texts: string[],
  target: SupportedLanguage
): Promise<string[]> {
  if (texts.length === 0) return texts
  if (!canRunLiveTranslation()) {
    throw new Error(
      "Translation is resting to save API limits. Wait a moment or use English."
    )
  }

  const out: string[] = []
  for (let i = 0; i < texts.length; i += LIVE_TRANSLATE_CHUNK_SIZE) {
    const chunk = texts.slice(i, i + LIVE_TRANSLATE_CHUNK_SIZE)
    markLiveTranslationRan()
    const part = await fetchLiveChunk(chunk, target)
    out.push(...part)
  }
  return out
}
