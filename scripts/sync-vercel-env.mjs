/**
 * Sync .env.local → Vercel (production, preview, development).
 * Usage: node scripts/sync-vercel-env.mjs
 */
import { readFileSync } from "fs"
import { spawnSync } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const envPath = resolve(root, ".env.local")
const environments = ["production", "preview", "development"]
const productionUrl = "https://agri-mind-ai.vercel.app"

function parseEnvFile(content) {
  const vars = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

function addEnv(key, value, env) {
  const result = spawnSync(
    "vercel",
    ["env", "add", key, env, "--value", value, "--force", "--yes"],
    {
      encoding: "utf8",
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    }
  )
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim()
    if (!err.includes("already exists")) {
      console.error(`FAIL ${key} [${env}]:`, err.slice(0, 200))
      return false
    }
  }
  return true
}

const raw = readFileSync(envPath, "utf8")
const vars = parseEnvFile(raw)

vars.NEXT_PUBLIC_APP_URL = productionUrl

const optionalDefaults = {
  OPENAI_TTS_MODEL: "tts-1",
  OPENAI_TTS_VOICE: "nova",
  NEXT_PUBLIC_WHATSAPP_SUPPORT: "94772117131",
}

for (const [k, v] of Object.entries(optionalDefaults)) {
  if (!vars[k]) vars[k] = v
}

let ok = 0
let fail = 0

for (const [key, value] of Object.entries(vars)) {
  if (!value) {
    console.log(`SKIP (empty): ${key}`)
    continue
  }
  for (const env of environments) {
    if (addEnv(key, value, env)) {
      ok++
      console.log(`OK: ${key} → ${env}`)
    } else {
      fail++
    }
  }
}

console.log(`\nDone. ${ok} set, ${fail} failed.`)
