import {
  valseaTranscribe,
  valseaTranslate,
  type TranscribeResult,
  type TranslateResult,
} from "@/lib/valsea/client"
import { toValseaLanguageName } from "@/lib/i18n/languages"
import {
  isValseaTranslateSupported,
  toValseaTranslateSource,
  toValseaTranslateTarget,
} from "@/lib/valsea/translate-languages"
import { translateTextWithOpenAI } from "@/services/openai-translate.service"
import { getFarmingAssistantReply } from "@/services/ai.service"
import type { SupportedLanguage } from "@/types"

export function toValseaLanguage(code: SupportedLanguage | string): string {
  return toValseaLanguageName(code)
}

export async function transcribeAudio(
  file: Blob,
  language: SupportedLanguage | "auto",
  filename?: string
): Promise<TranscribeResult> {
  return valseaTranscribe({
    file,
    filename,
    language:
      language === "auto" ? undefined : toValseaLanguage(language),
  })
}

export async function translateText(
  text: string,
  target: SupportedLanguage,
  source?: SupportedLanguage | "auto"
): Promise<TranslateResult> {
  if (target === "en" && (!source || source === "en" || source === "auto")) {
    return {
      translatedText: text,
      sourceLanguage: "english",
      targetLanguage: "english",
    }
  }

  const valseaTarget = toValseaTranslateTarget(target)
  if (valseaTarget) {
    return valseaTranslate({
      text,
      target: valseaTarget,
      source: toValseaTranslateSource(source ?? "auto"),
    })
  }

  const translatedText = await translateTextWithOpenAI(
    text,
    target,
    source ?? "en"
  )
  const lang = toValseaLanguageName(target)
  return {
    translatedText,
    sourceLanguage: toValseaTranslateSource(source ?? "en"),
    targetLanguage: lang,
  }
}

/** Voice/text assist — OpenAI + optional Valsea translation polish */
export async function getMultilingualFarmingReply(
  userMessage: string,
  language: SupportedLanguage,
  history?: { role: "user" | "assistant"; content: string }[]
): Promise<{ reply: string; replyEnglish: string }> {
  let query = userMessage.trim()

  if (language !== "en") {
    try {
      const toEnglish = await translateText(query, "en", language)
      if (toEnglish.translatedText?.trim()) {
        query = toEnglish.translatedText.trim()
      }
    } catch {
      /* use original message */
    }
  }

  const { reply: englishReply } = await getFarmingAssistantReply(
    query,
    "en",
    history
  )

  if (language === "en") {
    return { reply: englishReply, replyEnglish: englishReply }
  }

  try {
    const localized = await translateText(englishReply, language, "en")
    const reply = localized.translatedText?.trim() || englishReply
    return { reply, replyEnglish: englishReply }
  } catch {
    const direct = await getFarmingAssistantReply(
      userMessage,
      language,
      history
    )
    return { reply: direct.reply, replyEnglish: englishReply }
  }
}
