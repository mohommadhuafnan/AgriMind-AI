import OpenAI from "openai"

import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"

import { normalizeDiagnosisPayload } from "@/lib/openai/diagnosis-normalize"

import {

  getDiagnosisSystemPrompt,

  getFarmingSystemPrompt,

} from "@/lib/openai/prompts"

import { toVideoLinks } from "@/lib/youtube/links"

import type { CropDiagnosisResult } from "@/types/ai"

import type { ChatMessageInput, SupportedLanguage } from "@/types"



export async function generateFarmingChatReply(

  message: string,

  language: SupportedLanguage,

  history: ChatMessageInput[] = []

): Promise<string> {

  const openai = getOpenAIClient()



  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [

    { role: "system", content: getFarmingSystemPrompt(language) },

    ...history.slice(-10).map((m) => ({

      role: m.role as "user" | "assistant",

      content: m.content,

    })),

    { role: "user", content: message },

  ]



  const completion = await openai.chat.completions.create({

    model: openaiConfig.chatModel,

    messages,

    max_tokens: openaiConfig.maxTokens,

    temperature: 0.7,

  })



  const reply = completion.choices[0]?.message?.content?.trim()

  if (!reply) {

    throw new Error("OpenAI returned an empty response")

  }

  return reply

}



export async function* streamFarmingChatReply(

  message: string,

  language: SupportedLanguage,

  history: ChatMessageInput[] = []

): AsyncGenerator<string> {

  const openai = getOpenAIClient()



  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [

    { role: "system", content: getFarmingSystemPrompt(language) },

    ...history.slice(-10).map((m) => ({

      role: m.role as "user" | "assistant",

      content: m.content,

    })),

    { role: "user", content: message },

  ]



  const stream = await openai.chat.completions.create({

    model: openaiConfig.chatModel,

    messages,

    max_tokens: openaiConfig.maxTokens,

    temperature: 0.7,

    stream: true,

  })



  for await (const chunk of stream) {

    const delta = chunk.choices[0]?.delta?.content

    if (delta) yield delta

  }

}



function parseJsonFromModel(raw: string): unknown {

  const trimmed = raw.trim()

  try {

    return JSON.parse(trimmed)

  } catch {

    const match = trimmed.match(/\{[\s\S]*\}/)

    if (match) return JSON.parse(match[0])

    throw new Error("Failed to parse diagnosis JSON from OpenAI")

  }

}



export async function analyzeCropImage(params: {

  imageBase64: string

  imageUrl?: string

  cropType: string

  description?: string

  language: SupportedLanguage

}): Promise<CropDiagnosisResult> {

  const openai = getOpenAIClient()



  const visionImageUrl =
    params.imageUrl?.startsWith("http")
      ? params.imageUrl
      : params.imageBase64.startsWith("data:")
        ? params.imageBase64
        : `data:image/jpeg;base64,${params.imageBase64}`



  const userText = [

    `Farmer selected crop type: ${params.cropType}`,

    params.description ? `Farmer notes: ${params.description}` : "",

    "First verify this is a real plant/crop photo. If not, set isValidPlantImage false.",

    "If valid, write an EXPERT-LEVEL report for a Sri Lankan farmer: long cause analysis, 5+ detailed symptoms, 4+ treatment steps each with a 'details' paragraph (products, LKR costs, dosage), 5+ prevention paragraphs, and rich recoverySummary + estimatedRecovery + costEstimate.",

    "Do not use short placeholders. Return complete JSON only.",

  ]

    .filter(Boolean)

    .join("\n")



  const runVision = async (extraInstruction?: string) => {
    const completion = await openai.chat.completions.create({
      model: openaiConfig.visionModel,
      max_tokens: 4096,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: getDiagnosisSystemPrompt(params.language) },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: extraInstruction
                ? `${userText}\n\nIMPORTANT: ${extraInstruction}`
                : userText,
            },
            {
              type: "image_url",
              image_url: { url: visionImageUrl, detail: "high" },
            },
          ],
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      throw new Error("OpenAI vision returned an empty response")
    }
    return parseJsonFromModel(raw)
  }

  let parsed: unknown
  let normalized: ReturnType<typeof normalizeDiagnosisPayload>

  try {
    parsed = await runVision()
    normalized = normalizeDiagnosisPayload(parsed, params.cropType)
  } catch (err) {
    const isIncomplete =
      err instanceof Error && err.name === "DiagnosisIncompleteError"
    if (!isIncomplete) throw err

    parsed = await runVision(
      "Your previous JSON was incomplete. Fill EVERY required field with long, specific paragraphs. Minimum: 5 symptoms, 4 treatment steps with 4+ sentence details each, 5 prevention tips, recoverySummary, estimatedRecovery, costEstimate — all in the farmer's language."
    )
    normalized = normalizeDiagnosisPayload(parsed, params.cropType)
  }



  const videos = toVideoLinks(normalized.youtubeVideos)



  return {

    isValidPlantImage: normalized.isValidPlantImage ?? true,

    rejectionReason: normalized.rejectionReason,

    disease: normalized.disease,

    confidence: normalized.confidence,

    severity: normalized.severity,

    cause: normalized.cause,

    symptoms: normalized.symptoms,

    treatment: normalized.treatment,

    prevention: normalized.prevention,

    estimatedRecovery: normalized.estimatedRecovery,

    costEstimate: normalized.costEstimate,

    recoverySummary: normalized.recoverySummary,

    nutrients: normalized.nutrients?.length ? normalized.nutrients : undefined,

    pests: normalized.pests?.length ? normalized.pests : undefined,

    irrigationNotes: normalized.irrigationNotes,

    followUpAdvice: normalized.followUpAdvice,

    youtubeVideos: videos,

  }

}


