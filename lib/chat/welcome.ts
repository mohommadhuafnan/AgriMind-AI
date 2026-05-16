import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

export function getChatWelcomeMessage(language: SupportedLanguage): string {
  const label = getLanguageDisplayLabel(language)

  if (language === "en") {
    return `Hello! I'm your AgriMind AI farming assistant powered by OpenAI, with VALSEA.ai for multilingual replies.

I can help with crop diseases, treatments, fertilizers, pests, and Sri Lankan farming practices.

How can I assist you today?`
  }

  return `Hello! I'm AgriMind AI — your farming assistant.

Replies are translated into ${label} using VALSEA.ai. Ask about crops, diseases, weather, and local farming practices.

How can I help you today?`
}
