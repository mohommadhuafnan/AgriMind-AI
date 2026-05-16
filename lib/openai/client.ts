import OpenAI from "openai"
import { assertOpenAIConfigured, openaiConfig } from "./config"

let client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  assertOpenAIConfigured()
  if (!client) {
    client = new OpenAI({ apiKey: openaiConfig.apiKey })
  }
  return client
}

export { openaiConfig }
