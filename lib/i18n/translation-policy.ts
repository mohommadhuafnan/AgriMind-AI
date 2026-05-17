/** How AgriMind uses translation APIs (Valsea / OpenAI). */

/** UI shell + landing: built-in strings only — no API on language change. */
export const UI_USES_STATIC_TRANSLATIONS = true

/** Marketing page DOM scan: static + browser cache only (no live API). */
export const PAGE_DOM_USES_LIVE_API = false

/** Max live API strings per user action (diagnosis report, etc.). */
export const LIVE_TRANSLATE_MAX_STRINGS = 12

/** Min milliseconds between live batch API calls (per browser tab). */
export const LIVE_TRANSLATE_MIN_INTERVAL_MS = 45_000

/** Max strings per single live batch request. */
export const LIVE_TRANSLATE_CHUNK_SIZE = 8
