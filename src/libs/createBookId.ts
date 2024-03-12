import { cleanText } from "../libs/cleanText.ts"
import { getCharset } from "../libs/charsets.ts"
const charset = getCharset("en")
const clean = cleanText(charset)

export function createBookId(author: string | null, title: string | null) {
  return [author ?? "Unknown", title ?? "No Title"]
    .map((text) =>
      clean(text, { ignoreUnknownChars: true, replaceLetters: true })
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z-]/g, ""),
    )
    .join("--")
}
