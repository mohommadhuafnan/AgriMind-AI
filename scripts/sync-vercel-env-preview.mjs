/**
 * Retry preview env vars only (run after sync-vercel-env.mjs if preview failed).
 */
import { readFileSync } from "fs"
import { spawnSync } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const vars = {}
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith("#")) continue
  const eq = t.indexOf("=")
  if (eq === -1) continue
  let v = t.slice(eq + 1).trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
    v = v.slice(1, -1)
  vars[t.slice(0, eq).trim()] = v
}
vars.NEXT_PUBLIC_APP_URL = "https://agri-mind-ai.vercel.app"
for (const [k, v] of [
  ["OPENAI_TTS_MODEL", "tts-1"],
  ["OPENAI_TTS_VOICE", "nova"],
  ["NEXT_PUBLIC_WHATSAPP_SUPPORT", "94772117131"],
]) {
  if (!vars[k]) vars[k] = v
}

for (const [key, value] of Object.entries(vars)) {
  if (!value) continue
  spawnSync(
    "vercel",
    ["env", "add", key, "preview", "--value", value, "--force", "--yes"],
    { cwd: root, encoding: "utf8", shell: process.platform === "win32" }
  )
  console.log(`preview: ${key}`)
}
