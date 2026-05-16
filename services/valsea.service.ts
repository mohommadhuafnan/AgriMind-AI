import {

  valseaTranscribe,

  valseaTranslate,

  type TranscribeResult,

  type TranslateResult,

} from "@/lib/valsea/client"

import { toValseaLanguageName } from "@/lib/i18n/languages"

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

    language: language === "auto" ? "auto" : toValseaLanguage(language),

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

  return valseaTranslate({

    text,

    target: toValseaLanguage(target),

    source:

      source && source !== "auto" ? toValseaLanguage(source) : "auto",

  })

}



/** Voice/text assist — OpenAI + optional Valsea translation polish */

export async function getMultilingualFarmingReply(

  userMessage: string,

  language: SupportedLanguage,

  history?: { role: "user" | "assistant"; content: string }[]

): Promise<{ reply: string; replyEnglish: string }> {

  let { reply } = await getFarmingAssistantReply(userMessage, language, history)



  if (language !== "en") {

    try {

      const polished = await translateText(reply, language, "auto")

      if (polished.translatedText?.trim()) {

        reply = polished.translatedText

      }

    } catch {

      /* use OpenAI reply */

    }

  }



  return {

    reply,

    replyEnglish: reply,

  }

}

