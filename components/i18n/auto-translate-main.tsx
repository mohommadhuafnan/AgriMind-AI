"use client"

import { useCallback, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import {
  getPageTranslationCache,
  setPageTranslationCache,
} from "@/lib/i18n/storage"
import {
  applyTextTranslation,
  collectPlaceholderTargets,
  collectTextTargets,
  resolveTranslations,
  restoreEnglishPage,
} from "@/lib/i18n/page-translator-client"
export function AutoTranslateMain({ children }: { children: React.ReactNode }) {
  const { language, translateTexts, setPageTranslating } = useLanguage()
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)
  const runId = useRef(0)
  const applyingRef = useRef(false)
  const cacheRef = useRef<Record<string, Record<string, string>>>({})

  const runTranslation = useCallback(async () => {
    const root = rootRef.current
    if (!root || language === "en") return

    const currentRun = ++runId.current
    setPageTranslating(true)

    try {
      const textTargets = collectTextTargets(root)
      const placeholderTargets = collectPlaceholderTargets(root)

      const sources: string[] = []
      for (const t of textTargets) {
        if (!sources.includes(t.source)) sources.push(t.source)
      }
      for (const p of placeholderTargets) {
        if (!sources.includes(p.source)) sources.push(p.source)
      }

      if (sources.length === 0) return

      const langCache =
        cacheRef.current[language] ??
        getPageTranslationCache(language) ??
        {}
      const missing = sources.filter((s) => !langCache[s])

      if (missing.length > 0) {
        const apiResults = await translateTexts(missing)
        if (currentRun !== runId.current) return

        const resolved = resolveTranslations(language, missing, apiResults)
        resolved.forEach((value, key) => {
          langCache[key] = value
        })
        cacheRef.current[language] = langCache
        setPageTranslationCache(language, langCache)
      }

      if (currentRun !== runId.current) return

      applyingRef.current = true
      try {
        for (const { node, source } of textTargets) {
          const translated = langCache[source]
          if (translated && translated !== source) {
            applyTextTranslation(node, translated)
          }
        }

        for (const { el, source } of placeholderTargets) {
          const translated = langCache[source]
          if (translated && translated !== source) {
            el.setAttribute("placeholder", translated)
          }
        }
      } finally {
        applyingRef.current = false
      }
    } finally {
      if (currentRun === runId.current) {
        setPageTranslating(false)
      }
    }
  }, [language, translateTexts, setPageTranslating])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (language === "en") {
      restoreEnglishPage(root)
      return
    }

    const initial = window.setTimeout(() => {
      void runTranslation()
    }, 400)

    const observerDebounce = { current: 0 as ReturnType<typeof setTimeout> | 0 }

    const observer = new MutationObserver(() => {
      if (applyingRef.current) return
      window.clearTimeout(observerDebounce.current)
      observerDebounce.current = window.setTimeout(() => {
        void runTranslation()
      }, 800)
    })

    observer.observe(root, {
      childList: true,
      subtree: true,
    })

    return () => {
      window.clearTimeout(initial)
      window.clearTimeout(observerDebounce.current)
      observer.disconnect()
    }
  }, [language, pathname, runTranslation])

  useEffect(() => {
    const onLanguageReady = () => {
      if (language !== "en") void runTranslation()
    }
    window.addEventListener("agrimind:language-ready", onLanguageReady)
    return () =>
      window.removeEventListener("agrimind:language-ready", onLanguageReady)
  }, [language, runTranslation])

  return (
    <div ref={rootRef} className="min-h-0" data-translate-root>
      {children}
    </div>
  )
}
