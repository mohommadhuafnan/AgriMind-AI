"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { getLandingStaticTranslation } from "@/lib/i18n/landing-static"
import {
  getPageTranslationCache,
  setPageTranslationCache,
} from "@/lib/i18n/storage"

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "SVG",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
])

function shouldSkip(el: Element): boolean {
  if (el.closest("[data-no-translate]")) return true
  if (el.closest("[data-i18n-key]")) return true
  if (el.closest("[data-slot='dropdown-menu']")) return true
  if (SKIP_TAGS.has(el.tagName)) return true
  return false
}

/** Direct text nodes only (e.g. button label next to an icon) */
function getOwnText(el: HTMLElement): string | null {
  const parts: string[] = []
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent?.trim()
      if (t) parts.push(t)
    }
  }
  const text = parts.join(" ").trim()
  if (!text || text.length > 600) return null
  return text
}

function getSourceText(el: HTMLElement): string | null {
  const placeholder = el.getAttribute("placeholder")
  if (placeholder?.trim()) {
    if (!el.dataset.i18nOrigPlaceholder) {
      el.dataset.i18nOrigPlaceholder = placeholder
    }
    return el.dataset.i18nOrigPlaceholder
  }

  const text = getOwnText(el)
  if (!text) return null
  if (!el.dataset.i18nOrig) {
    el.dataset.i18nOrig = text
  }
  return el.dataset.i18nOrig
}

function applyTranslation(el: HTMLElement, translated: string) {
  if (el.dataset.i18nOrigPlaceholder) {
    el.setAttribute("placeholder", translated)
    return
  }
  const orig = el.dataset.i18nOrig
  if (!orig) return

  let replaced = false
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent?.trim()
      if (t && !replaced) {
        node.textContent = node.textContent?.replace(t, translated) ?? translated
        replaced = true
      } else if (t && replaced) {
        node.textContent = ""
      }
    }
  }
  if (!replaced) {
    el.textContent = translated
  }
}

function restoreEnglish(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-i18n-orig]").forEach((el) => {
    applyTranslation(el, el.dataset.i18nOrig!)
  })
  root.querySelectorAll<HTMLElement>("[data-i18n-orig-placeholder]").forEach((el) => {
    if (el.dataset.i18nOrigPlaceholder) {
      el.setAttribute("placeholder", el.dataset.i18nOrigPlaceholder)
    }
  })
}

const BLOCK_TAGS =
  "h1,h2,h3,h4,h5,h6,p,label,button,a,th,td,li,span,dt,dd,figcaption,blockquote,[placeholder],[data-slot='card-title'],[data-slot='card-description']"

export function AutoTranslateMain({ children }: { children: React.ReactNode }) {
  const { language, translateTexts } = useLanguage()
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)
  const runId = useRef(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (language === "en") {
      restoreEnglish(root)
      return
    }

    const currentRun = ++runId.current

    const timer = window.setTimeout(async () => {
      const elements: HTMLElement[] = []
      const sources: string[] = []

      root.querySelectorAll<HTMLElement>(BLOCK_TAGS).forEach((el) => {
        if (shouldSkip(el)) return
        const src = getSourceText(el)
        if (!src) return
        elements.push(el)
        sources.push(src)
      })

      if (sources.length === 0) return

      const unique = [...new Set(sources)]
      const pageCache = getPageTranslationCache(language) ?? {}

      for (const src of unique) {
        if (pageCache[src]) continue
        const builtIn = getLandingStaticTranslation(language, src)
        if (builtIn) pageCache[src] = builtIn
      }

      const missing = unique.filter((u) => !pageCache[u])

      if (missing.length > 0) {
        const translatedMissing = await translateTexts(missing)
        missing.forEach((src, i) => {
          pageCache[src] = translatedMissing[i] ?? src
        })
        setPageTranslationCache(language, pageCache)
      }

      if (currentRun !== runId.current) return

      sources.forEach((src, i) => {
        applyTranslation(elements[i], pageCache[src] ?? src)
      })
    }, 600)

    return () => window.clearTimeout(timer)
  }, [language, translateTexts, pathname, children])

  return (
    <div ref={rootRef} className="min-h-0" data-translate-root>
      {children}
    </div>
  )
}
