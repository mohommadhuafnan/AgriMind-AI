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
import {
  UI_CATALOG,
  UI_CATALOG_KEYS,
  type UiCatalogKey,
} from "@/lib/i18n/ui-catalog"
import {
  getStaticUiTranslations,
  hasBuiltInShellTranslations,
  isCatalogComplete,
  mergeTranslations,
  type TranslationMap,
} from "@/lib/i18n/static-ui"
import {
  getCachedTranslations,
  getStoredLanguage,
  setCachedTranslations,
  setStoredLanguage,
} from "@/lib/i18n/storage"
import {
  getAsianLanguage,
  getLanguagesByRegion,
  type AsianLanguage,
} from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

interface LanguageContextValue {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => Promise<void>
  t: (key: UiCatalogKey) => string
  translateTexts: (texts: string[]) => Promise<string[]>
  isTranslating: boolean
  isPageTranslating: boolean
  setPageTranslating: (value: boolean) => void
  languageGroups: ReturnType<typeof getLanguagesByRegion>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

async function fetchBatchTranslations(
  texts: string[],
  target: SupportedLanguage
): Promise<string[]> {
  const CHUNK = 35
  const out: string[] = []

  for (let i = 0; i < texts.length; i += CHUNK) {
    const chunk = texts.slice(i, i + CHUNK)
    const res = await fetch("/api/valsea/translate-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: chunk, target, source: "en" }),
    })
    const json = await res.json()
    if (!res.ok) {
      const msg = json.error ?? "Translation failed"
      if (res.status === 503) {
        throw new Error(
          `${msg} Restart \`npm run dev\` after updating .env.local and Vercel env.`
        )
      }
      throw new Error(msg)
    }
    const part = (json.data?.translations as string[]) ?? chunk
    out.push(...part)
  }

  return out
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
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPageTranslating, setPageTranslating] = useState(false)
  const languageGroups = useMemo(() => getLanguagesByRegion(), [])

  const loadCatalog = useCallback(async (lang: SupportedLanguage) => {
    if (lang === "en") {
      setMap({})
      return
    }

    const staticMap = getStaticUiTranslations(lang)
    if (staticMap) {
      setMap(staticMap)
    }

    const cached = getCachedTranslations(lang)
    if (cached && isCatalogComplete(cached as TranslationMap)) {
      setMap(mergeTranslations(lang, staticMap, cached as TranslationMap))
      return
    }

    if (hasBuiltInShellTranslations(lang) && staticMap) {
      setIsTranslating(false)
    } else {
      setIsTranslating(true)
    }

    try {
      const english = UI_CATALOG_KEYS.map((k) => UI_CATALOG[k])
      const translated = await fetchBatchTranslations(english, lang)
      const fromApi: TranslationMap = {}
      UI_CATALOG_KEYS.forEach((key, i) => {
        fromApi[key] = translated[i] ?? UI_CATALOG[key]
      })
      const merged = mergeTranslations(lang, staticMap, fromApi, cached as TranslationMap)
      setMap(merged)
      setCachedTranslations(lang, merged as Record<string, string>)
    } catch (err) {
      if (!staticMap) {
        toast.error(
          err instanceof Error ? err.message : "Valsea translation failed"
        )
        setMap({})
      }
    } finally {
      setIsTranslating(false)
    }
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
        toast.success(`${info.nativeLabel} — translating site…`, {
          duration: 2000,
        })
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
      if (language === "en") return texts
      if (texts.length === 0) return texts
      try {
        return await fetchBatchTranslations(texts, language)
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not translate page content."
        toast.error(msg)
        return texts
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
