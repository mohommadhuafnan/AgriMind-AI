import { getAsianLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

const WELCOME_AUTO =
  "Welcome! Speak in your mother tongue — Tamil, Sinhala, Hindi, English, or any language. AgriMind detects what you say and answers in the same language. You do not need to pick a language first."

const WELCOME_BY_CODE: Partial<Record<SupportedLanguage, string>> = {
  en: "Hello! Tap the microphone and ask your farming question. VALSEA.ai understands your voice; AgriMind replies with audio.",
  si: "ආයුබෝවන්! මයික්‍රොෆෝනය ඔබා ගොවිතැන් ප්‍රශ්නය අහන්න. VALSEA.ai ඔබේ කථනය අවබෝධ කරයි.",
  ta: "வணக்கம்! மைக்ரோஃபோனை அழுத்தி விவசாய கேள்வியைக் கேளுங்கள். VALSEA.ai உங்கள் குரலைப் புரிந்துகொள்கிறது.",
  hi: "नमस्ते! माइक्रोफ़ोन दबाएँ और अपना कृषि प्रश्न पूछें। VALSEA.ai आपकी आवाज़ समझता है।",
  th: "สวัสดี! แตะไมโครโฟนแล้วถามคำถามเกี่ยวกับการเกษตร VALSEA.ai รับรู้เสียงของคุณ",
  zh: "你好！点击麦克风，提出您的农业问题。VALSEA.ai 识别您的语音。",
  ja: "こんにちは！マイクをタップして農業の質問をしてください。VALSEA.ai が音声を理解します。",
  ko: "안녕하세요! 마이크를 눌러 농업 질문을 하세요. VALSEA.ai가 음성을 이해합니다.",
}

export function getVoiceWelcomeMessage(
  code: SupportedLanguage | "auto"
): string {
  if (code === "auto") return WELCOME_AUTO

  const specific = WELCOME_BY_CODE[code]
  if (specific) return specific

  const info = getAsianLanguage(code)
  const label = info?.nativeLabel ?? info?.label ?? code
  return `Welcome! Tap the microphone and ask your farming question in ${label}. VALSEA.ai transcribes your voice; AgriMind replies with audio.`
}
