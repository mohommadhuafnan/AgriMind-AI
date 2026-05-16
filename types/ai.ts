import type { SupportedLanguage } from "@/types"

export interface ChatMessageInput {
  role: "user" | "assistant"
  content: string
}

export interface FarmingChatRequest {
  message: string
  language: SupportedLanguage
  history?: ChatMessageInput[]
}

export interface FarmingChatResponse {
  reply: string
  language: SupportedLanguage
}

export interface DiagnosisTreatmentStep {
  step: number
  action: string
  timing: string
}

export interface DiagnosisYoutubeVideo {
  title: string
  searchQuery: string
  language?: string
  url?: string
}

export interface CropDiagnosisResult {
  /** False when the image is not a real plant/crop photo */
  isValidPlantImage?: boolean
  /** User-facing message when isValidPlantImage is false */
  rejectionReason?: string
  disease: string
  confidence: number
  severity: "low" | "medium" | "high"
  cause: string
  symptoms: string[]
  treatment: DiagnosisTreatmentStep[]
  prevention: string[]
  estimatedRecovery: string
  costEstimate: string
  nutrients?: string[]
  pests?: string[]
  irrigationNotes?: string
  followUpAdvice?: string
  youtubeVideos?: DiagnosisYoutubeVideo[]
}

export interface DiagnoseCropRequest {
  imageBase64: string
  cropType: string
  description?: string
  language: SupportedLanguage
}
