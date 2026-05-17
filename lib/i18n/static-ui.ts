import type { SupportedLanguage } from "@/lib/i18n/languages"
import { HI_UI } from "@/lib/i18n/bundled/hi-ui"
import {
  UI_CATALOG,
  UI_CATALOG_KEYS,
  type UiCatalogKey,
} from "@/lib/i18n/ui-catalog"



type StaticMap = Partial<Record<UiCatalogKey, string>>



const SI: StaticMap = {

  "nav.dashboard": "උපකරණ පුවරුව",

  "nav.crops": "මගේ බෝග",

  "nav.diagnosis": "AI රෝග විනිශ්චය",

  "nav.diagnosisHistory": "විනිශ්චය ඉතිහාසය",

  "nav.voice": "හඬ සහායක",

  "nav.market": "වෙළඳපල මිල",

  "nav.weather": "කාලගුණය",

  "nav.chat": "AI කතාබහ",

  "nav.reminders": "සිහිකැඳවීම්",

  "nav.settings": "සැකසීම්",

  "nav.profile": "පැතිකඩ",

  "nav.signOut": "පිට වන්න",

  "header.search": "බෝග, රෝග, මාර්ගෝපදේශ සොයන්න...",

  "header.notifications": "දැනුම්දීම්",

  "common.loading": "පරිවර්තනය වෙමින්…",

  "common.saving": "සුරකිමින්...",

  "auth.signedOut": "සාර්ථකව පිට විය",

  "crops.addTitle": "බෝගයක් එක් කරන්න",

  "crops.addSubtitle": "නව ක්ෂේත්‍රයක් හෝ බෝග ප්ලොට් එකක් ලියාපදිංචි කරන්න.",

  "crops.detailsTitle": "බෝග විස්තර",

  "crops.fieldName": "ක්ෂේත්‍ර නාමය",

  "crops.cropType": "බෝග වර්ගය",

  "crops.stage": "අදියර",

  "crops.health": "සෞඛ්‍ය %",

  "crops.status": "තත්වය",

  "crops.plantedDate": "වගා කළ දිනය",

  "crops.expectedHarvest": "අපේක්ෂිත අස්වැන්න",

  "crops.area": "ප්‍රමාණය",

  "crops.unit": "ඒකකය",

  "crops.location": "ස්ථානය",

  "crops.nextTask": "ඊළඟ කාර්යය",

  "crops.notes": "සටහන්",

  "crops.selectCrop": "බෝගය තෝරන්න",

  "crops.createCrop": "බෝගය සාදන්න",

  "crops.saveCrop": "බෝගය සුරකින්න",

  "crops.fieldLocationPh": "ක්ෂේත්‍ර ස්ථානය",

  "crops.nextTaskPh": "පොහොර යොදන්න",

  "crops.status.healthy": "සෞඛ්‍ය සම්පන්න",

  "crops.status.warning": "අවවාදය",

  "crops.status.critical": "අවදානම්",

  "crops.unit.acres": "අක්කර",

  "crops.unit.hectares": "හෙක්ටයාර්",

  "crops.unit.perches": "පර්චස්",

  "crops.stage.preparation": "සූදානම",

  "crops.stage.planting": "වගාව",

  "crops.stage.growing": "වැඩෙමින්",

  "crops.stage.flowering": "මල් පිපෙමින්",

  "crops.stage.fruiting": "ගෙඩි",

  "crops.stage.harvesting": "අස්වැන්න",
  "dashboard.greetingMorning": "සුභ උදෑසනක්",
  "dashboard.greetingAfternoon": "සුභ දහවලක්",
  "dashboard.greetingEvening": "සුභ සන්ධ්‍යාවක්",
  "dashboard.welcomeSubtitle": "ඔබේ AI ගොවිතැන් දළ විශ්ලේෂණය — MongoDB වෙතින් සජීව දත්ත.",
  "dashboard.scanCrop.title": "බෝගය ස්කෑන් කරන්න",
  "dashboard.scanCrop.desc":
    "ඡායාරූපයක් ගන්න — AI රෝග හඳුනාගෙන ප්‍රතිකාර යෝජනා කරයි.",
  "dashboard.scanCrop.cta": "රෝග විනිශ්චය ආරම්භ කරන්න",
  "dashboard.askAi.title": "AI අසන්න",
  "dashboard.askAi.desc":
    "සිංහල, දෙමළ හෝ ඉංග්‍රීසියෙන් කතා කරන්න — ගොවිතැන් උපකාර තත්පර කිහිපයකින්.",
  "dashboard.askAi.cta": "හඬ සහායක විවෘත කරන්න",
  "diagnosis.title": "AI බෝග රෝග විනිශ්චය",
  "diagnosis.subtitle":
    "ඡායාරූපයක් උඩුගත කරන්න — රෝග, කෘමීන්, පෝෂ්‍යතා හා ප්‍රතිකාර සැලසුම්.",
  "diagnosis.viewHistory": "ඉතිහාසය බලන්න",
  "diagnosis.issueDetails": "ගැටලු විස්තර",
  "diagnosis.cropType": "බෝග වර්ගය",
  "diagnosis.notPlantTitle": "බෝග ඡායාරූපයක් නොවේ",
  "diagnosis.notPlantHint":
    "පැහැදිලි බෝග ඡායාරූපයක් උඩුගත කරන්න — කොළ, අතු හෝ ගෙඩි.",
  "diagnosis.causeAnalysis": "හේතු විශ්ලේෂණය",
  "diagnosis.symptoms": "හඳුනාගත් ලක්ෂණ",
  "diagnosis.treatment": "AI ප්‍රතිකාර සැලසුම",
  "diagnosis.prevention": "ප්‍රතිරෝධ උපදෙස්",
  "diagnosis.analyze": "AI සමඟ විශ්ලේෂණය",
  "diagnosis.newDiagnosis": "නව විනිශ්චය",

}



const TA: StaticMap = {

  "nav.dashboard": "டாஷ்போர்டு",

  "nav.crops": "எனது பயிர்கள்",

  "nav.diagnosis": "செயற்கை நோயறிதல்",

  "nav.diagnosisHistory": "நோயறிதல் வரலாறு",

  "nav.voice": "குரல் உதவியாளர்",

  "nav.market": "சந்தை விலைகள்",

  "nav.weather": "வானிலை",

  "nav.chat": "செயற்கை அரட்டை",

  "nav.reminders": "நினைவூட்டல்கள்",

  "nav.settings": "அமைப்புகள்",

  "nav.profile": "சுயவிவரம்",

  "nav.signOut": "வெளியேறு",

  "header.search": "பயிர்கள், நோய்கள், வழிகாட்டிகள் தேடுங்கள்...",

  "header.notifications": "அறிவிப்புகள்",

  "common.loading": "மொழிபெயர்கிறது…",

  "common.saving": "சேமிக்கிறது...",

  "auth.signedOut": "வெற்றிகரமாக வெளியேறினீர்கள்",

  "crops.addTitle": "பயிர் சேர்",

  "crops.addSubtitle": "புதிய வயல் அல்லது பயிர் மனையை பதிவு செய்யுங்கள்.",

  "crops.detailsTitle": "பயிர் விவரங்கள்",

  "crops.fieldName": "களத்தின் பெயர்",

  "crops.cropType": "பயிர் வகை",

  "crops.stage": "வளர்ச்சி நிலை",

  "crops.health": "ஆரோக்கியம் %",

  "crops.status": "நிலை",

  "crops.plantedDate": "நடப்பட்ட தேதி",

  "crops.expectedHarvest": "எதிர்பார்க்கப்படும் அறுவடை",

  "crops.area": "பகுதி",

  "crops.unit": "அலகு",

  "crops.location": "அமைவிடம்",

  "crops.nextTask": "அடுத்த பணி",

  "crops.notes": "குறிப்புகள்",

  "crops.selectCrop": "பயிர் தேர்வுசெய்",

  "crops.createCrop": "பயிரை உருவாக்கு",

  "crops.saveCrop": "பயிரைச் சேமி",

  "crops.fieldLocationPh": "வயல் இடம்",

  "crops.nextTaskPh": "உரம் இடுங்கள்",

  "crops.status.healthy": "ஆரோக்கியமான",

  "crops.status.warning": "எச்சரிக்கை",

  "crops.status.critical": "முக்கியமான",

  "crops.unit.acres": "ஏக்கர்",

  "crops.unit.hectares": "ஹெக்டேர்",

  "crops.unit.perches": "பெர்ச்",

  "crops.stage.preparation": "தயாரிப்பு",

  "crops.stage.planting": "நடவு",

  "crops.stage.growing": "வளர்ச்சி",

  "crops.stage.flowering": "பூக்கும்",

  "crops.stage.fruiting": "கனி",

  "crops.stage.harvesting": "அறுவடை",
  "dashboard.greetingMorning": "காலை வணக்கம்",
  "dashboard.greetingAfternoon": "மதிய வணக்கம்",
  "dashboard.greetingEvening": "மாலை வணக்கம்",
  "dashboard.welcomeSubtitle": "உங்கள் AI விவசாய கண்ணோட்டம் — MongoDB இலிருந்து நேரடி தரவு.",
  "dashboard.scanCrop.title": "பயிரை ஸ்கேன் செய்",
  "dashboard.scanCrop.desc":
    "புகைப்படம் எடுங்கள் — AI நோயை கண்டறிந்து சிகிச்சை பரிந்துரைக்கிறது.",
  "dashboard.scanCrop.cta": "நோயறிதலைத் தொடங்கு",
  "dashboard.askAi.title": "AI கேளுங்கள்",
  "dashboard.askAi.desc":
    "தமிழ், சிங்களம் அல்லது ஆங்கிலத்தில் பேசுங்கள் — விவசாய உதவி விநாடிகளில்.",
  "dashboard.askAi.cta": "குரல் உதவியாளரைத் திற",
  "diagnosis.title": "AI பயிர் நோயறிதல்",
  "diagnosis.subtitle":
    "புகைப்படம் பதிவேற்றம் — நோய், பூச்சி, ஊட்டச்சத்து மற்றும் சிகிச்சை திட்டம்.",
  "diagnosis.viewHistory": "வரலாறு பார்",
  "diagnosis.issueDetails": "பிரச்சனை விவரங்கள்",
  "diagnosis.cropType": "பயிர் வகை",
  "diagnosis.notPlantTitle": "பயிர் புகைப்படம் அல்ல",
  "diagnosis.notPlantHint":
    "தெளிவான பயிர் புகைப்படம் பதிவேற்றுங்கள் — இலை, தண்டு அல்லது கனி.",
  "diagnosis.causeAnalysis": "காரண பகுப்பாய்வு",
  "diagnosis.symptoms": "கண்டறியப்பட்ட அறிகுறிகள்",
  "diagnosis.treatment": "AI சிகிச்சை திட்டம்",
  "diagnosis.prevention": "தடுப்பு குறிப்புகள்",
  "diagnosis.analyze": "AI உடன் பகுப்பாய்வு",
  "diagnosis.newDiagnosis": "புதிய நோயறிதல்",

}



const STATIC_BY_LANG: Partial<Record<SupportedLanguage, StaticMap>> = {
  si: SI,
  ta: TA,
  hi: HI_UI,
}



export function getStaticUiTranslations(

  lang: SupportedLanguage

): TranslationMap | null {

  if (lang === "en") return null

  const partial = STATIC_BY_LANG[lang]

  if (!partial) return null

  return partial as TranslationMap

}



export function hasBuiltInShellTranslations(lang: SupportedLanguage): boolean {
  return lang === "si" || lang === "ta" || lang === "hi"
}

export function isShellCatalogComplete(map: TranslationMap): boolean {
  return SHELL_CATALOG_KEYS.every((key) => Boolean(map[key]))
}



export type TranslationMap = Partial<Record<UiCatalogKey, string>>



export function mergeTranslations(

  lang: SupportedLanguage,

  ...layers: (TranslationMap | null | undefined)[]

): TranslationMap {

  if (lang === "en") return {}

  const merged: TranslationMap = {}

  for (const layer of layers) {

    if (!layer) continue

    for (const key of UI_CATALOG_KEYS) {

      if (layer[key]) merged[key] = layer[key]

    }

  }

  return merged

}



export function isCatalogComplete(map: TranslationMap): boolean {

  return UI_CATALOG_KEYS.every((key) => Boolean(map[key]))

}



/** Keys required for sidebar + header (instant UI) */

export const SHELL_CATALOG_KEYS: UiCatalogKey[] = [

  "app.name",

  "nav.dashboard",

  "nav.crops",

  "nav.diagnosis",

  "nav.diagnosisHistory",

  "nav.voice",

  "nav.market",

  "nav.weather",

  "nav.chat",

  "nav.reminders",

  "nav.settings",

  "nav.profile",

  "nav.signOut",

  "header.search",

  "header.notifications",

]



export function getEnglishCatalogValues(keys: UiCatalogKey[] = UI_CATALOG_KEYS): string[] {

  return keys.map((k) => UI_CATALOG[k])

}


