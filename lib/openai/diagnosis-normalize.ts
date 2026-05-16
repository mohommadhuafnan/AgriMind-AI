import type { CropDiagnosisResult } from "@/types/ai"

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v.trim() || fallback
  if (typeof v === "number") return String(v)
  return fallback
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    if (typeof v === "string" && v.trim()) return [v.trim()]
    return []
  }
  return v
    .map((item) => {
      if (typeof item === "string") return item.trim()
      if (item && typeof item === "object" && "text" in item) {
        return asString((item as { text: unknown }).text)
      }
      return ""
    })
    .filter(Boolean)
}

function normalizeSeverity(v: unknown): "low" | "medium" | "high" {
  const s = asString(v).toLowerCase()
  if (s.includes("high") || s.includes("severe")) return "high"
  if (s.includes("low") || s.includes("mild")) return "low"
  if (s.includes("medium") || s.includes("moderate")) return "medium"
  return "medium"
}

function normalizeTreatment(v: unknown): CropDiagnosisResult["treatment"] {
  if (!Array.isArray(v)) return []

  const steps: CropDiagnosisResult["treatment"] = []
  v.forEach((item, index) => {
    if (typeof item === "string" && item.trim()) {
      steps.push({
        step: index + 1,
        action: item.trim(),
        timing: "As soon as possible",
      })
      return
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>
      const action = asString(o.action ?? o.description ?? o.title)
      if (!action) return
      steps.push({
        step: Number(o.step) > 0 ? Number(o.step) : index + 1,
        action,
        timing: asString(o.timing ?? o.when ?? o.schedule, "Follow label instructions"),
      })
    }
  })
  return steps
}

function normalizeVideos(
  v: unknown,
  cropType: string,
  disease: string
): { title: string; searchQuery: string; language?: string }[] {
  let fromAi: { title: string; searchQuery: string; language?: string }[] = []

  if (Array.isArray(v)) {
    fromAi = v
      .map((item) => {
        if (typeof item === "string") {
          return { title: item, searchQuery: `${item} ${cropType} Sri Lanka farming` }
        }
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>
          const title = asString(o.title)
          const searchQuery = asString(o.searchQuery ?? o.query ?? o.search ?? title)
          if (!title && !searchQuery) return null
          return {
            title: title || searchQuery,
            searchQuery: searchQuery || `${title} ${cropType}`,
            language: asString(o.language) || undefined,
          }
        }
        return null
      })
      .filter((x): x is { title: string; searchQuery: string; language?: string } =>
        Boolean(x)
      )
  }

  if (fromAi.length >= 2) return fromAi.slice(0, 4)

  const d = disease.toLowerCase()
  return [
    {
      title: `${disease} treatment — ${cropType}`,
      searchQuery: `${cropType} ${d} treatment Sri Lanka agriculture`,
      language: "English",
    },
    {
      title: `${cropType} disease management`,
      searchQuery: `${cropType} disease symptoms organic treatment farming`,
      language: "English",
    },
    {
      title: `පැල් රෝග පාලනය — ${cropType}`,
      searchQuery: `${cropType} leaf disease Sinhala farmer treatment`,
      language: "සිංහල",
    },
  ]
}

const NON_PLANT_PATTERNS = [
  /not\s+(a\s+)?plant/i,
  /no\s+plant/i,
  /does\s+not\s+contain\s+any\s+plant/i,
  /not\s+contain\s+.*plant/i,
  /not\s+a\s+crop/i,
  /no\s+visible\s+plant/i,
  /unrelated\s+to\s+plant/i,
  /diagram\s+or\s+chart/i,
  /handwriting/i,
  /document/i,
  /invalid\s+image/i,
  /please\s+upload.*plant/i,
]

function textSuggestsNonPlant(...parts: string[]): boolean {
  const blob = parts.join(" ").toLowerCase()
  return NON_PLANT_PATTERNS.some((re) => re.test(blob))
}

function resolvePlantValidity(o: Record<string, unknown>): {
  isValidPlantImage: boolean
  rejectionReason: string
} {
  const explicit =
    o.isValidPlantImage === false ||
    o.is_valid_plant_image === false ||
    o.validPlantImage === false

  const rejectionReason = asString(
    o.rejectionReason ?? o.rejection_reason ?? o.userMessage ?? o.message
  )

  const disease = asString(o.disease)
  const cause = asString(o.cause)
  const confidence = Number(o.confidence)

  const heuristic =
    explicit ||
    textSuggestsNonPlant(rejectionReason, disease, cause) ||
    (confidence <= 20 &&
      textSuggestsNonPlant(disease, cause, asString(o.followUpAdvice)))

  if (!heuristic) {
    return { isValidPlantImage: true, rejectionReason: "" }
  }

  const reason =
    rejectionReason ||
    cause ||
    "This image does not show a plant or crop. Please upload a clear photo of leaves, stems, fruits, or the field."

  return { isValidPlantImage: false, rejectionReason: reason }
}

/** Coerce loose OpenAI JSON into a strict diagnosis shape */
export function normalizeDiagnosisPayload(
  raw: unknown,
  cropType: string
): CropDiagnosisResult & {
  youtubeVideos: { title: string; searchQuery: string; language?: string }[]
} {
  const o =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}

  const { isValidPlantImage, rejectionReason } = resolvePlantValidity(o)

  if (!isValidPlantImage) {
    const cause =
      asString(o.cause) ||
      rejectionReason ||
      `The uploaded image does not show a real plant or crop. It may be handwriting, a diagram, a document, or another non-plant subject. Please take a new photo in natural light showing the affected plant parts (leaves, stems, or fruit) and try again.`

    return {
      isValidPlantImage: false,
      rejectionReason,
      disease: asString(o.disease, "Not a plant image"),
      confidence: 0,
      severity: "low",
      cause,
      symptoms: asStringArray(o.symptoms),
      treatment: normalizeTreatment(o.treatment),
      prevention: asStringArray(o.prevention),
      estimatedRecovery: asString(o.estimatedRecovery, "—"),
      costEstimate: asString(o.costEstimate, "—"),
      followUpAdvice:
        asString(o.followUpAdvice) ||
        "Upload a clear photo of your crop in the field or garden.",
      youtubeVideos: [],
    }
  }

  let disease = asString(o.disease, "Plant health issue")
  if (
    disease.toLowerCase() === "unknown" ||
    disease.toLowerCase().includes("not supported") ||
    disease.toLowerCase().includes("cannot analyze")
  ) {
    disease = "Visual crop analysis"
  }

  let confidence = Number(o.confidence)
  if (Number.isNaN(confidence)) confidence = 70
  confidence = Math.min(100, Math.max(40, Math.round(confidence)))

  const symptoms = asStringArray(o.symptoms)
  const treatment = normalizeTreatment(o.treatment)
  const prevention = asStringArray(o.prevention)

  const cause =
    asString(o.cause) ||
    `Based on visual analysis of your ${cropType} sample. Review symptoms and apply the treatment plan below.`

  return {
    isValidPlantImage: true,
    disease,
    confidence,
    severity: normalizeSeverity(o.severity),
    cause,
    symptoms:
      symptoms.length > 0
        ? symptoms
        : [
            "Visible changes detected on leaves or stems — compare with treatment guide",
            "Monitor spread over the next 3–5 days",
          ],
    treatment:
      treatment.length > 0
        ? treatment
        : [
            {
              step: 1,
              action: "Remove severely affected leaves and destroy away from the field",
              timing: "Immediately",
            },
            {
              step: 2,
              action: "Apply recommended fungicide or organic treatment per local officer advice",
              timing: "Within 24–48 hours",
            },
            {
              step: 3,
              action: "Improve airflow, avoid overhead watering at night",
              timing: "Ongoing",
            },
          ],
    prevention:
      prevention.length > 0
        ? prevention
        : [
            "Use certified disease-free seeds or seedlings",
            "Rotate crops and maintain field hygiene",
            "Scout weekly during humid weather",
          ],
    estimatedRecovery: asString(o.estimatedRecovery, "2–4 weeks with timely treatment"),
    costEstimate: asString(o.costEstimate, "Rs. 2,000–8,000 depending on treatment choice"),
    nutrients: asStringArray(o.nutrients),
    pests: asStringArray(o.pests),
    irrigationNotes: asString(o.irrigationNotes) || undefined,
    followUpAdvice:
      asString(o.followUpAdvice) ||
      "Re-check plants every 3 days. Upload a new photo if symptoms worsen.",
    youtubeVideos: normalizeVideos(o.youtubeVideos, cropType, disease),
  }
}
