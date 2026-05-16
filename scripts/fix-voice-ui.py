from pathlib import Path

p = Path(__file__).resolve().parent.parent / "app/dashboard/voice/page.tsx"
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)

# Find duplicate language block start (second occurrence after header)
start = None
for i, line in enumerate(lines):
    if 'className="flex justify-center gap-2 rounded-full bg-muted p-1 w-fit mx-auto"' in line:
        start = i
        break

if start is None:
    raise SystemExit("language block not found")

end = start
while end < len(lines) and "space-y-4 overflow-y-auto p-4 sm:p-6" not in lines[end]:
    end += 1
if end >= len(lines):
    raise SystemExit("scroll area not found")

# Close header flex row + motion header before main card
insert_close = "        </div>\n      </motion.div>\n\n"
replacement = [
    insert_close,
    '      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:mx-6">\n',
    '        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">\n',
    '          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">\n',
]

# Remove lines from start to end (exclusive of messages map line content)
new_lines = lines[:start] + replacement + lines[end + 1 :]

# Fix footer: motion.div inner should close with motion.div (already done at 506)

text = "".join(new_lines)
# Remove duplicate header close if we now have double close
text = text.replace(
    "        </motion.div>\n      </motion.div>\n\n        </div>\n      </motion.div>",
    "        </div>\n      </motion.div>",
    1,
)

p.write_text(text, encoding="utf-8")
print("done", start, end)
