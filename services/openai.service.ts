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

    "If valid, analyze visible disease, pest, or nutrient issues.",

    "Return complete JSON including isValidPlantImage.",

  ]

    .filter(Boolean)

    .join("\n")



  const completion = await openai.chat.completions.create({

    model: openaiConfig.visionModel,

    max_tokens: 2500,

    temperature: 0.2,

    response_format: { type: "json_object" },

    messages: [

      { role: "system", content: getDiagnosisSystemPrompt(params.language) },

      {

        role: "user",

        content: [

          { type: "text", text: userText },

          { type: "image_url", image_url: { url: visionImageUrl, detail: "high" } },

        ],

      },

    ],

  })



  const raw = completion.choices[0]?.message?.content

  if (!raw) {

    throw new Error("OpenAI vision returned an empty response")

  }



  const parsed = parseJsonFromModel(raw)

  const normalized = normalizeDiagnosisPayload(parsed, params.cropType)



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

    nutrients: normalized.nutrients?.length ? normalized.nutrients : undefined,

    pests: normalized.pests?.length ? normalized.pests : undefined,

    irrigationNotes: normalized.irrigationNotes,

    followUpAdvice: normalized.followUpAdvice,

    youtubeVideos: videos,

  }

}


