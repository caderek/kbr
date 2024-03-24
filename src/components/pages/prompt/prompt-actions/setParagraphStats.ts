import { produce, type SetStoreFunction } from "solid-js/store"
import type { LocalState } from "../types.ts"
import { calculateParagraphWpm } from "../prompt-util/calculateParagraphWpm.ts"
import { calculateParagraphConsistency } from "../prompt-util/calculateParagraphConsistency.ts"
import { calculateParagraphAccuracy } from "../prompt-util/calculateParagraphAccuracy.ts"
import { getParagraphMissedWords } from "../prompt-util/getParagraphMissedWords.ts"
import { saveParagraph } from "./saveParagraph.ts"

export function setParagraphStats(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  setLocal("paused", true)

  const currentParagraph = local.stats[local.paragraphNum]

  const acc = calculateParagraphAccuracy(
    currentParagraph.nonTypos,
    currentParagraph.typos,
    currentParagraph.acc,
  )

  const wpm = calculateParagraphWpm(
    currentParagraph.inputTimes,
    currentParagraph.words,
    currentParagraph.wpm,
  )

  const consistency = calculateParagraphConsistency(
    currentParagraph.inputTimes,
    currentParagraph.consistency,
  )

  const missedWords = getParagraphMissedWords(
    currentParagraph.words,
    local.original[local.paragraphNum],
  )

  setLocal(
    "stats",
    local.paragraphNum,
    produce((state) => {
      if (!Number.isNaN(acc.value)) {
        state.acc = acc
      }

      if (!Number.isNaN(wpm.value)) {
        state.wpm = wpm
      }

      if (!Number.isNaN(consistency.value)) {
        state.consistency = consistency
      }

      // Clean temp data
      state.typos = 0
      state.nonTypos = 0
      state.inputTimes = []
      state.words = state.words.map((entry) => ({
        length: entry.length,
        typedLength: 0,
        times: [[]],
        isCorrect: entry.isCorrect,
        hadTypos: false,
        typosIndicies: [],
      }))
    }),
  )

  if (local.id) {
    saveParagraph(
      local.id,
      local.paragraphNum,
      local.length,
      {
        wpm,
        acc,
        consistency,
      },
      missedWords,
    )
  }
}
