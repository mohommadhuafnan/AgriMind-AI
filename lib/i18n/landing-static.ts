import type { SupportedLanguage } from "@/lib/i18n/languages"

/** Instant landing translations (Sinhala & Tamil) while Valsea loads the rest */
const LANDING: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  si: {
    Features: "විශේෂාංග",
    "How It Works": "ක්‍රියාකාරී ආකාරය",
    Crops: "බෝග",
    Testimonials: "ප්‍රශංසා",
    Pricing: "මිල ගණන්",
    "Simple billing for farmers": "ගොවීන්ට සරල බිල්පත්",
    "Plans That Grow": "ඔබේ ගොවිතැන සමඟ වැඩෙන සැලසුම්",
    "With Your Farm": "ඔබේ ගොවිතැන සමඟ",
    "Free Trial": "නොමිලේ අත්හදා බැලීම",
    "30-Day Plan": "දින 30 සැලසුම",
    "1-Year Plan": "වසර 1 සැලසුම",
    "Start Free Trial": "නොමිලේ අත්හදා බැලීම ආරම්භ කරන්න",
    "Get 30-Day Plan": "දින 30 සැලසුම ලබාගන්න",
    "Get 1-Year Plan": "වසර 1 සැලසුම ලබාගන්න",
    "Sign In": "පිවිසෙන්න",
    "Get Started": "ආරම්භ කරන්න",
    "Start Free": "නොමිලේ ආරම්භ කරන්න",
    "AI Voice Assistant": "AI හඬ සහායක",
    "Speak Naturally in": "ස්වාභාවිකව කතා කරන්න",
    "Your Language": "ඔබේ භාෂාවෙන්",
    "Try Voice Assistant": "හඬ සහායකය උත්සාහ කරන්න",
    "Your AI Farming Partner": "ඔබේ AI ගොවි සහකාර",
    "From Seed To Harvest": "බීජයේ සිට අස්වැන්න දක්වා",
    "AI-Powered Farming Assistant": "AI බලගැන්වූ ගොවි සහායක",
    "Watch Demo": "ඩෙමෝ නරඹන්න",
    "Active Farmers": "සක්‍රිය ගොවීන්",
    "Accuracy Rate": "නිරවද්‍යතා අනුපාතය",
    "AI Support": "AI සහාය",
    Online: "මාර්ගගත",
    "Voice Support": "හඬ සහාය",
    "3 Languages": "භාෂා 3ක්",
    "Photo Analysis": "ඡායාරූප විශ්ලේෂණය",
    "AI Detection": "AI හඳුනාගැනීම",
    "Type or speak your question...": "ඔබේ ප්‍රශ්නය ටයිප් කරන්න හෝ කතා කරන්න...",
    "Scroll to explore": "ගවේෂණයට අනුචලනය කරන්න",
    "Generating treatment plan...": "ප්‍රතිකාර සැලසුම සකසමින්...",
    "Speak in Sinhala, Tamil, or English — Valsea transcribes your voice, OpenAI answers, and natural text-to-speech reads replies aloud.":
      "සිංහල, දෙමළ හෝ ඉංග්‍රීසියෙන් කතා කරන්න — Valsea ඔබේ හඬ ලියා තබා, OpenAI පිළිතුරු දෙයි.",
    "AgriMind AI helps Sri Lankan farmers with crop disease detection, multilingual voice support, and smart farming guidance. Available 24/7 in Sinhala, Tamil, and English.":
      "AgriMind AI ශ්‍රී ලංකාවේ ගොවීන්ට බෝග රෝග හඳුනාගැනීම, බහුභාෂා හඬ සහාය සහ ස්මාර්ට් ගොවි මාර්ගෝපදේශනය සපයයි. සිංහල, දෙමළ සහ ඉංග්‍රීසියෙන් 24/7.",
    "My tomato leaves are turning yellow with brown spots":
      "මගේ තක්කාලි කොළ කහ පැහැයට හැරෙමින් දුඹුරු ලුණු තිබේ",
    "Based on your description, this appears to be": "ඔබේ විස්තරය අනුව, මෙය විය හැක්කේ",
    "Early Blight": "ප්‍රාරම්භක පලුවැල්ල",
    "Let me analyze further. Can you upload a photo?":
      "තවදුරට විශ්ලේෂණය කරමු. ඡායාරූපයක් උඩුගත කළ හැකිද?",
  },
  ta: {
    Features: "அம்சங்கள்",
    "How It Works": "எப்படி செயல்படுகிறது",
    Crops: "பயிர்கள்",
    Testimonials: "பாராட்டுகள்",
    Pricing: "விலை நிர்ணயம்",
    "Simple billing for farmers": "விவசாயிகளுக்கு எளிய பில்லிங்",
    "Plans That Grow": "உங்கள் பண்ணையுடன் வளரும் திட்டங்கள்",
    "With Your Farm": "உங்கள் பண்ணையுடன்",
    "Free Trial": "இலவச சோதனை",
    "30-Day Plan": "30 நாள் திட்டம்",
    "1-Year Plan": "1 வருட திட்டம்",
    "Start Free Trial": "இலவச சோதனையைத் தொடங்கு",
    "Get 30-Day Plan": "30 நாள் திட்டத்தைப் பெறு",
    "Get 1-Year Plan": "1 வருட திட்டத்தைப் பெறு",
    "Sign In": "உள்நுழை",
    "Get Started": "தொடங்கு",
    "Start Free": "இலவசமாக தொடங்கு",
    "AI Voice Assistant": "AI குரல் உதவியாளர்",
    "Speak Naturally in": "இயல்பாக பேசுங்கள்",
    "Your Language": "உங்கள் மொழியில்",
    "Try Voice Assistant": "குரல் உதவியை முயற்சிக்கவும்",
    "Your AI Farming Partner": "உங்கள் AI விவசாய கூட்டாளர்",
    "From Seed To Harvest": "விதையிலிருந்து அறுவடை வரை",
    "AI-Powered Farming Assistant": "AI இயங்கும் விவசாய உதவியாளர்",
    "Watch Demo": "டெமோவைப் பார்க்க",
    "Active Farmers": "செயலில் உள்ள விவசாயிகள்",
    "Accuracy Rate": "துல்லிய விகிதம்",
    "AI Support": "AI ஆதரவு",
    Online: "ஆன்லைன்",
    "Voice Support": "குரல் ஆதரவு",
    "3 Languages": "3 மொழிகள்",
    "Photo Analysis": "புகைப்பட பகுப்பாய்வு",
    "AI Detection": "AI கண்டறிதல்",
    "Type or speak your question...": "உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள் அல்லது பேசுங்கள்...",
    "Scroll to explore": "ஆராய உருட்டவும்",
    "Generating treatment plan...": "சிகிச்சை திட்டம் உருவாக்கப்படுகிறது...",
    "Speak in Sinhala, Tamil, or English — Valsea transcribes your voice, OpenAI answers, and natural text-to-speech reads replies aloud.":
      "சிங்களம், தமிழ் அல்லது ஆங்கிலத்தில் பேசுங்கள் — Valsea உங்கள் குரலை எழுத்துபெயர்க்கிறது, OpenAI பதிலளிக்கிறது.",
    "AgriMind AI helps Sri Lankan farmers with crop disease detection, multilingual voice support, and smart farming guidance. Available 24/7 in Sinhala, Tamil, and English.":
      "AgriMind AI இலங்கை விவசாயிகளுக்கு பயிர் நோய் கண்டறிதல், பலமொழி குரல் ஆதரவு மற்றும் ஸ்மார்ட் விவசாய வழிகாட்டுதல் வழங்குகிறது. சிங்களம், தமிழ், ஆங்கிலம் 24/7.",
    "My tomato leaves are turning yellow with brown spots":
      "என் தக்காளி இலைகள் பழுப்பு புள்ளிகளுடன் மஞ்சளாக மாறுகின்றன",
    "Based on your description, this appears to be": "உங்கள் விளக்கத்தின்படி, இது",
    "Early Blight": "ஆரம்ப பிளைட்",
    "Let me analyze further. Can you upload a photo?":
      "மேலும் பகுப்பாய்வு செய்கிறேன். புகைப்படம் பதிவேற்ற முடியுமா?",
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
