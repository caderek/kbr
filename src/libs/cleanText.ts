import { replacements, shouldIgnore } from "./charsets"

type Options = {
  replaceLetters: boolean
  ignoreUnknownChars: boolean
}

const defaultOptions: Options = {
  replaceLetters: false,
  ignoreUnknownChars: false,
}

export const cleanText =
  (charset: Set<string>) =>
  (text: string, options: Partial<Options> = {}) => {
    const cfg = { ...defaultOptions, ...options }

    const base = text
      .replace(/\n+/g, " ")
      .replace(/\t+/g, " ")
      .replace(/^[* ]+$/, "***")
      .replace(/\s*\. \. \./g, "...")
      .replace(/\s--\s/g, " - ")
      .replace(/[,.?!][A-Z]/g, (v) => `${v[0]} ${v[1]}`) // fix no space between end of sentence and new sentence
      .replace(/\s[,.?!]/g, (v) => v[1]) // remove space before interpunction
      .trim()

    const cleaned: string[] = []

    for (const char of base) {
      if (charset.has(char)) {
        cleaned.push(char)
      } else if (!shouldIgnore(char)) {
        const subSymbol = replacements.symbols[char]
        const subLetter = cfg.replaceLetters ? replacements.letters[char] : undefined

        cleaned.push(subSymbol ?? subLetter ?? (cfg.ignoreUnknownChars ? "" : char))
      }
    }

    return cleaned
      .join("")
      .replace(/:\s-\s$/, ":")
      .replace(/\s+/g, " ")
      .trim()
  }
