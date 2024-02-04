import { replacements, shouldIgnore } from "./charsets"

export const cleanText = (charsets: Set<string>) => (text: string) => {
  const base = text
    .replace(/\n+/g, " ")
    .replace(/\t+/g, " ")
    .replace("THE FULL PROJECT GUTENBERG LICENSE", "") // removes empty page at the end of PG books
    .replace(/^[* ]+$/, "***")
    .trim()

  const cleaned: string[] = []

  for (const char of base) {
    if (charsets.has(char)) {
      cleaned.push(char)
    } else if (!shouldIgnore(char)) {
      const sub = replacements.symbols[char]

      cleaned.push(sub ?? char)
    }
  }

  return cleaned
    .join("")
    .replace(/:\s-\s$/, ":")
    .replace(/\s+/g, " ")
    .trim()
}
