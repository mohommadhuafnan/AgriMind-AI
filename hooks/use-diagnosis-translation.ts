"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import type { CropDiagnosisResult } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

function collectTexts(d: CropDiagnosisResult): string[] {
  const texts: string[] = [
    d.disease,
    d.cause,
    d.rejectionReason ?? "",
    d.estimatedRecovery,
    d.costEstimate,
    d.recoverySummary ?? "",
    d.irrigationNotes ?? "",
    d.followUpAdvice ?? "",
    ...d.symptoms,
    ...d.prevention,
    ...(d.nutrients ?? []),
    ...(d.pests ?? []),
    ...d.treatment.flatMap((t) => [t.action, t.timing, t.details ?? ""]),
    ...(d.youtubeVideos ?? []).map((v) => v.title),
  ]
  return texts.filter(Boolean)
}

function applyTranslations(
  source: CropDiagnosisResult,
  originals: string[],
  translated: string[]
): CropDiagnosisResult {
  const map = new Map<string, string>()
  originals.forEach((orig, i) => {
    if (orig && translated[i]) map.set(orig, translated[i])
  })
  const tr = (s: string) => map.get(s) ?? s

  return {
    ...source,
    disease: tr(source.disease),
    cause: tr(source.cause),
    rejectionReason: source.rejectionReason
      ? tr(source.rejectionReason)
      : undefined,
    estimatedRecovery: tr(source.estimatedRecovery),
    costEstimate: tr(source.costEstimate),
    recoverySummary: source.recoverySummary
      ? tr(source.recoverySummary)
      : undefined,
    irrigationNotes: source.irrigationNotes
      ? tr(source.irrigationNotes)
      : undefined,
    followUpAdvice: source.followUpAdvice
      ? tr(source.followUpAdvice)
      : undefined,
    symptoms: source.symptoms.map(tr),
    prevention: source.prevention.map(tr),
    nutrients: source.nutrients?.map(tr),
    pests: source.pests?.map(tr),
    treatment: source.treatment.map((step) => ({
      ...step,
      action: tr(step.action),
      timing: tr(step.timing),
      details: step.details ? tr(step.details) : undefined,
    })),
    youtubeVideos: source.youtubeVideos?.map((v) => ({
      ...v,
      title: tr(v.title),
    })),
  }
}

/** Translate diagnosis report via Valsea when UI language changes */
export function useDiagnosisTranslation(
  source: CropDiagnosisResult | null,
  sourceLanguage: SupportedLanguage
) {
  const { language, translateTextsLive } = useLanguage()
  const [display, setDisplay] = useState<CropDiagnosisResult | null>(source)
  const [translating, setTranslating] = useState(false)
  const runId = useRef(0)

  useEffect(() => {
    setDisplay(source)
  }, [source])

  useEffect(() => {
    if (!source) {
      setDisplay(null)
      return
    }

    if (language === sourceLanguage) {
      setDisplay(source)
      return
    }

    const currentRun = ++runId.current
    setTranslating(true)

    void (async () => {
      try {
        const originals = collectTexts(source)
        const translated = await translateTextsLive(originals)
        if (currentRun !== runId.current) return
        setDisplay(applyTranslations(source, originals, translated))
      } catch {
        if (currentRun === runId.current) setDisplay(source)
      } finally {
        if (currentRun === runId.current) setTranslating(false)
      }
    })()
  }, [source, sourceLanguage, language, translateTextsLive])

  return { displayDiagnosis: display, translating }
}
