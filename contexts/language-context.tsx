"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"
import { fetchLiveTranslations } from "@/lib/i18n/client-translate-queue"
import { resolveStaticTexts } from "@/lib/i18n/resolve-static"
import {
  getCachedTranslations,
  getPageTranslationCache,
  getStoredLanguage,
  setCachedTranslations,
  setPageTranslationCache,
  setStoredLanguage,
} from "@/lib/i18n/storage"
import {
  getStaticUiTranslations,
  hasBuiltInShellTranslations,
  isShellCatalogComplete,
  mergeTranslations,
  type TranslationMap,
} from "@/lib/i18n/static-ui"
import { UI_USES_STATIC_TRANSLATIONS } from "@/lib/i18n/translation-policy"
import {
  getAsianLanguage,
  getLanguagesByRegion,
  type AsianLanguage,
} from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"
import { UI_CATALOG, type UiCatalogKey } from "@/lib/i18n/ui-catalog"

interface LanguageContextValue {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => Promise<void>
  t: (key: UiCatalogKey) => string
  /** Static + cache only — for landing page DOM (no API). */
  translateTexts: (texts: string[]) => Promise<string[]>
  /** Rate-limited API — diagnosis reports only. */
  translateTextsLive: (texts: string[]) => Promise<string[]>
  isTranslating: boolean
  isPageTranslating: boolean
  setPageTranslating: (value: boolean) => void
  languageGroups: ReturnType<typeof getLanguagesByRegion>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function buildCatalogMap(lang: SupportedLanguage): TranslationMap {
  const staticMap = getStaticUiTranslations(lang)
  const cached = getCachedTranslations(lang)
  return mergeTranslations(lang, staticMap, cached as TranslationMap)
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: SupportedLanguage
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    initialLanguage ?? "en"
  )
  const [map, setMap] = useState<TranslationMap>({})
  const [isTranslating] = useState(false)
  const [isPageTranslating, setPageTranslating] = useState(false)
  const languageGroups = useMemo(() => getLanguagesByRegion(), [])

  const loadCatalog = useCallback(async (lang: SupportedLanguage) => {
    if (lang === "en") {
      setMap({})
      return
    }

    const merged = buildCatalogMap(lang)
    setMap(merged)

    if (UI_USES_STATIC_TRANSLATIONS && hasBuiltInShellTranslations(lang)) {
      if (isShellCatalogComplete(merged)) {
        setCachedTranslations(lang, merged as Record<string, string>)
        return
      }
    }

    // No bulk Valsea/OpenAI for UI catalog — show English for any missing keys
    setCachedTranslations(lang, merged as Record<string, string>)
  }, [])

  useEffect(() => {
    const stored = getStoredLanguage()
    setLanguageState(stored)
    void loadCatalog(stored).then(() => {
      if (stored !== "en" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("agrimind:language-ready"))
      }
    })
  }, [loadCatalog])

  useEffect(() => {
    if (typeof document === "undefined") return
    const lang = getAsianLanguage(language)
    document.documentElement.lang = lang?.bcp47?.split("-")[0] ?? language
  }, [language])

  const setLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      setLanguageState(lang)
      setStoredLanguage(lang)
      await loadCatalog(lang)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("agrimind:language-ready"))
      }
      if (lang !== "en") {
        const info = getAsianLanguage(lang) as AsianLanguage
        toast.success(`${info.nativeLabel}`, { duration: 1500 })
      }
    },
    [loadCatalog]
  )

  const t = useCallback(
    (key: UiCatalogKey) => {
      if (language === "en") return UI_CATALOG[key]
      return map[key] ?? UI_CATALOG[key]
    },
    [language, map]
  )

  const translateTexts = useCallback(
    async (texts: string[]) => {
      if (language === "en" || texts.length === 0) return texts

      const pageCache = getPageTranslationCache(language) ?? {}
      const { resolved, missingIndices } = resolveStaticTexts(language, texts)

      const stillMissing: number[] = []
      for (const i of missingIndices) {
        const src = texts[i]
        const cached = pageCache[src]
        if (cached) {
          resolved[i] = cached
        } else {
          stillMissing.push(i)
        }
      }

      // Save newly resolved static strings into page cache
      if (missingIndices.length > 0) {
        const updated = { ...pageCache }
        missingIndices.forEach((i) => {
          if (resolved[i] !== texts[i]) updated[texts[i]] = resolved[i]
        })
        setPageTranslationCache(language, updated)
      }

      return resolved
    },
    [language]
  )

  const translateTextsLive = useCallback(
    async (texts: string[]) => {
      if (language === "en" || texts.length === 0) return texts

      const { resolved, missingIndices } = resolveStaticTexts(language, texts)
      if (missingIndices.length === 0) return resolved

      const toTranslate = missingIndices.map((i) => texts[i])
      try {
        const live = await fetchLiveTranslations(toTranslate, language)
        missingIndices.forEach((origIndex, j) => {
          resolved[origIndex] = live[j] ?? texts[origIndex]
        })
        return resolved
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Live translation unavailable",
          { id: "valsea-translate-error" }
        )
        return resolved
      }
    },
    [language]
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translateTexts,
      translateTextsLive,
      isTranslating: isTranslating || isPageTranslating,
      isPageTranslating,
      setPageTranslating,
      languageGroups,
    }),
    [
      language,
      setLanguage,
      t,
      translateTexts,
      translateTextsLive,
      isTranslating,
      isPageTranslating,
      languageGroups,
    ]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}
