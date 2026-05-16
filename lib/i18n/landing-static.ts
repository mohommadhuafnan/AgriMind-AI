import type { SupportedLanguage } from "@/lib/i18n/languages"

/** Pre-translated landing page phrases (Sinhala & Tamil) — used before / without VALSEA API */
const LANDING: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  si: {
    Features: "විශේෂාංග",
    "How It Works": "ක්‍රියාකාරී ආකාරය",
    Crops: "බෝග",
    Testimonials: "ප්‍රශංසා",
    "Sign In": "පිවිසෙන්න",
    "Get Started": "ආරම්භ කරන්න",
    "AI Voice Assistant": "AI හඬ සහායක",
    "Speak Naturally in": "ස්වාභාවිකව කතා කරන්න",
    "Your Language": "ඔබේ භාෂාවෙන්",
    "Try Voice Assistant": "හඬ සහායකය උත්සාහ කරන්න",
    "Speak in Sinhala, Tamil, or English — Valsea transcribes your voice, OpenAI answers, and natural text-to-speech reads replies aloud.":
      "සිංහල, දෙමළ හෝ ඉංග්‍රීසියෙන් කතා කරන්න — Valsea ඔබේ හඬ ලියා තබා, OpenAI පිළිතුරු දෙයි, ස්වාභාවික හඬ උච්චාරණයෙන් පිළිතුරු කියවයි.",
    "Your AI Farming Partner": "ඔබේ AI ගොවි සහකාර",
    "From Seed To Harvest": "බීජයේ සිට අස්වැන්න දක්වා",
    "AI-Powered Farming Assistant": "AI බලගැන්වූ ගොවි සහායක",
    "Watch Demo": "ඩෙමෝ නරඹන්න",
  },
  ta: {
    Features: "அம்சங்கள்",
    "How It Works": "எப்படி செயல்படுகிறது",
    Crops: "பயிர்கள்",
    Testimonials: "பாராட்டுகள்",
    "Sign In": "உள்நுழை",
    "Get Started": "தொடங்கு",
    "AI Voice Assistant": "AI குரல் உதவியாளர்",
    "Speak Naturally in": "இயல்பாக பேசுங்கள்",
    "Your Language": "உங்கள் மொழியில்",
    "Try Voice Assistant": "குரல் உதவியை முயற்சிக்கவும்",
    "Speak in Sinhala, Tamil, or English — Valsea transcribes your voice, OpenAI answers, and natural text-to-speech reads replies aloud.":
      "சிங்களம், தமிழ் அல்லது ஆங்கிலத்தில் பேசுங்கள் — Valsea உங்கள் குரலை எழுத்துபெயர்க்கிறது, OpenAI பதிலளிக்கிறது, இயற்கையான குரல் பதில்களை வாசிக்கிறது.",
    "Your AI Farming Partner": "உங்கள் AI விவசாய கூட்டாளர்",
    "From Seed To Harvest": "விதையிலிருந்து அறுவடை வரை",
    "AI-Powered Farming Assistant": "AI இயங்கும் விவசாய உதவியாளர்",
    "Watch Demo": "டெமோவைப் பார்க்க",
  },
}

export function getLandingStaticTranslation(
  lang: SupportedLanguage,
  english: string
): string | null {
  if (lang === "en") return null
  const table = LANDING[lang]
  if (!table) return null
  return table[english] ?? null
}
