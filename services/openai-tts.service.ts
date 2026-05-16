import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"

const MAX_TTS_CHARS = 4096

export function truncateForTts(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TTS_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_TTS_CHARS - 1)}…`
}

/** OpenAI text-to-speech — natural voice, works well for en/si/ta text */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const openai = getOpenAIClient()
  const input = truncateForTts(text)

  const response = await openai.audio.speech.create({
    model: openaiConfig.ttsModel,
    voice: openaiConfig.ttsVoice,
    input,
    response_format: "mp3",
    speed: 1,
  })

  return Buffer.from(await response.arrayBuffer())
}
