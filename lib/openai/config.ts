export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  chatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
  visionModel: process.env.OPENAI_VISION_MODEL ?? "gpt-4o",
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS ?? 1500),
  ttsModel: process.env.OPENAI_TTS_MODEL ?? "tts-1",
  ttsVoice: (process.env.OPENAI_TTS_VOICE ?? "nova") as
    | "alloy"
    | "echo"
    | "fable"
    | "onyx"
    | "nova"
    | "shimmer",
}

export function assertOpenAIConfigured() {
  if (!openaiConfig.apiKey) {
    throw new Error("OPENAI_API_KEY is not set in .env.local")
  }
}
