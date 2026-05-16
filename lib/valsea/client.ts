import { VALSEA_MODELS } from "./constants"

const BASE_URL = process.env.VALSEA_API_BASE_URL ?? "https://api.valsea.ai"

function getApiKey(): string {
  const key = process.env.VALSEA_API_KEY
  if (!key) {
    throw new Error("VALSEA_API_KEY is not configured in .env.local")
  }
  return key
}

function authHeaders(contentType?: string): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
  }
  if (contentType) {
    headers["Content-Type"] = contentType
  }
  return headers
}

export interface TranscribeOptions {
  file: Blob
  filename?: string
  language: string
  enableCorrection?: boolean
  enableTags?: boolean
}

export interface TranscribeResult {
  text: string
  clarifiedText?: string
  rawTranscript?: string
}

export async function valseaTranscribe(
  options: TranscribeOptions
): Promise<TranscribeResult> {
  const formData = new FormData()
  formData.append(
    "file",
    options.file,
    options.filename ?? "recording.webm"
  )
  formData.append("model", VALSEA_MODELS.transcribe)
  formData.append("language", options.language)
  formData.append(
    "enable_correction",
    String(options.enableCorrection ?? true)
  )
  formData.append("enable_tags", String(options.enableTags ?? false))
  formData.append("response_format", "verbose_json")

  const res = await fetch(`${BASE_URL}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getApiKey()}` },
    body: formData,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      (data as { message?: string })?.message ??
      `Transcription failed (${res.status})`
    throw new Error(message)
  }

  const verbose = data as {
    text?: string
    clarified_text?: string
    raw_transcript?: string
  }

  return {
    text: verbose.text ?? "",
    clarifiedText: verbose.clarified_text,
    rawTranscript: verbose.raw_transcript,
  }
}

export interface TranslateOptions {
  text: string
  target: string
  source?: string
}

export interface TranslateResult {
  translatedText: string
  sourceLanguage?: string
  targetLanguage?: string
}

const TRANSLATE_TIMEOUT_MS = 25_000

export async function valseaTranslate(
  options: TranslateOptions
): Promise<TranslateResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}/v1/translations`, {
      method: "POST",
      headers: authHeaders("application/json"),
      body: JSON.stringify({
        model: VALSEA_MODELS.translate,
        text: options.text,
        source: options.source ?? "auto",
        target: options.target,
        response_format: "verbose_json",
      }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Valsea translation timed out. Try again.")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      (data as { message?: string })?.message ??
      `Translation failed (${res.status})`
    throw new Error(message)
  }

  const result = data as {
    translated_text?: string
    source_language?: string
    target_language?: string
  }

  return {
    translatedText: result.translated_text ?? "",
    sourceLanguage: result.source_language,
    targetLanguage: result.target_language,
  }
}
