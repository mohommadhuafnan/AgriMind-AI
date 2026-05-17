/** Plain text for text-to-speech (strip markdown). */
export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim()
}

/** Short preview for speech when reply is very long */
export function textForSpeech(text: string, maxChars = 1200): string {
  const plain = stripMarkdownForSpeech(text)
  if (plain.length <= maxChars) return plain
  return `${plain.slice(0, maxChars)}…`
}
