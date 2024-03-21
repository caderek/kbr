import config from "../../../../config"
import { symbols } from "../../../../libs/charsets"
import type { WordStats } from "../types"

const SYMBOLS = [...symbols, config.ENTER_SYMBOL].join("\\")
const SYMBOLS_START_REGEX = new RegExp(`^[${SYMBOLS}]*`)
const SYMBOLS_END_REGEX = new RegExp(`[${SYMBOLS}]*$`)

export function getParagraphMissedWords(
  wordsStats: WordStats[],
  original: string[][],
) {
  const missedWords = []

  for (let i = 0; i < wordsStats.length; i++) {
    if (
      wordsStats[i].hadTypos &&
      wordsStats[i].typosIndicies.some((j) => !symbols.has(original[i][j]))
    ) {
      const word = original[i]
        .join("")
        .toLowerCase()
        .trim()
        .replace(SYMBOLS_START_REGEX, "")
        .replace(SYMBOLS_END_REGEX, "")

      missedWords.push(word)
    }
  }

  return missedWords
}
