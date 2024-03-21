import { produce, type SetStoreFunction } from "solid-js/store"
import type { LocalState } from "../types.ts"
import { formatPercentage } from "../../../../utils/formatters.ts"
import { calculateParagraphWpm } from "../prompt-util/calculateParagraphWpm.tsx"
import { calculateParagraphConsistency } from "../prompt-util/calculateParagraphConsistency.tsx"
import { calculateParagraphAccuracy } from "../prompt-util/calculateParagraphAccuracy.tsx"

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
    local.stats[local.paragraphNum].inputTimes,
    local.stats[local.paragraphNum].consistency,
  )

  console.log({ consistency: formatPercentage(consistency.value) })

  setLocal(
    "stats",
    local.paragraphNum,
    produce((state) => {
      state.acc = acc
      state.wpm = wpm
      state.consistency = consistency

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
      }))
    }),
  )

  // Save paragraph stats
}
