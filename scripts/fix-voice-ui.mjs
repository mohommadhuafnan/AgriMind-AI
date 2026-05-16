import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const p = join(dirname(fileURLToPath(import.meta.url)), "../app/dashboard/voice/page.tsx")
let text = readFileSync(p, "utf8")

const old = `      <div className="flex justify-center gap-2 rounded-full bg-muted p-1 w-fit mx-auto">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={\`rounded-full px-4 py-2 text-sm font-medium transition-colors \${
              language === lang.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }\`}
          >
            {lang.native}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">`

const neu = `        </div>
      </motion.div>

      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:mx-6">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">`

if (!text.includes(old)) {
  console.error("block not found")
  process.exit(1)
}

text = text.replace(old, neu)
text = text.replace(
  '          <motion.div className="mx-auto w-full max-w-4xl space-y-5">',
  '          <div className="mx-auto w-full max-w-4xl space-y-5">'
)
text = text.replace(
  "          </motion.div>\n        </div>\n      </div>\n\n      <Sheet",
  "          </div>\n        </div>\n      </div>\n\n      <Sheet"
)

writeFileSync(p, text)
console.log("ok")
