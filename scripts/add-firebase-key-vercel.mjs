import { readFileSync, writeFileSync, unlinkSync } from "fs"
import { spawnSync } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const line = readFileSync(resolve(root, ".env.local"), "utf8")
  .split(/\r?\n/)
  .find((l) => l.startsWith("FIREBASE_ADMIN_PRIVATE_KEY="))
if (!line) throw new Error("FIREBASE_ADMIN_PRIVATE_KEY not found")
let value = line.slice("FIREBASE_ADMIN_PRIVATE_KEY=".length).trim()
if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)

const tmp = resolve(root, ".vercel-firebase-key.tmp")
writeFileSync(tmp, value, "utf8")

for (const env of ["production", "preview", "development"]) {
  const r = spawnSync(
    "cmd",
    ["/c", `type "${tmp}" | vercel env add FIREBASE_ADMIN_PRIVATE_KEY ${env} --force --yes`],
    { cwd: root, encoding: "utf8" }
  )
  console.log(env, r.status === 0 ? "OK" : (r.stderr || r.stdout || "FAIL").slice(0, 200))
}

unlinkSync(tmp)
