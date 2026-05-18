import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"
import { ttsInstructionsForLanguage } from "@/lib/voice/tts-policy"
import type { SupportedLanguage } from "@/types"

const MAX_TTS_CHARS = 4096

export function truncateForTts(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TTS_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_TTS_CHARS - 1)}…`
}

function ttsModelForLanguage(language?: SupportedLanguage): string {
  const instructions = language ? ttsInstructionsForLanguage(language) : undefined
  if (instructions) {
    return process.env.OPENAI_TTS_MULTILINGUAL_MODEL ?? "gpt-4o-mini-tts"
  }
  return openaiConfig.ttsModel
}

/** OpenAI text-to-speech — mother-tongue replies for ta/si/hi via instructions */
export async function synthesizeSpeech(
  text: string,
  language?: SupportedLanguage
): Promise<Buffer> {
  const openai = getOpenAIClient()
  const input = truncateForTts(text)
  const instructions = language
    ? ttsInstructionsForLanguage(language)
    : undefined
  const model = ttsModelForLanguage(language)

  try {
    const response = await openai.audio.speech.create({
      model,
      voice: openaiConfig.ttsVoice,
      input,
      response_format: "mp3",
      speed: language === "en" ? 1 : 0.95,
      ...(instructions ? { instructions } : {}),
    })
    return Buffer.from(await response.arrayBuffer())
  } catch (err) {
    if (!instructions || model === openaiConfig.ttsModel) throw err
    const response = await openai.audio.speech.create({
      model: openaiConfig.ttsModel,
      voice: openaiConfig.ttsVoice,
      input,
      response_format: "mp3",
      speed: 0.95,
    })
    return Buffer.from(await response.arrayBuffer())
  }
}
