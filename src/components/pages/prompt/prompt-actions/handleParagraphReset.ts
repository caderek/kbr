import type { SetStoreFunction } from "solid-js/store"
import type { LocalState } from "../types"

export function handleParagraphReset(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  setLocal("typed", local.paragraphNum, (prev) =>
    prev.map((word) => new Array(word.length).fill(null)),
  )
  setLocal("stats", local.paragraphNum, (prev) => {
    return {
      ...prev,
      wpm: null,
      acc: null,
      inputTimes: [],
      keystokesTimes: [],
      totalKeystrokes: 0,
      typos: 0,
      nonTypos: 0,
      words: local.original[local.paragraphNum].map((chars) => ({
        length: chars.length,
        typedLength: 0,
        times: [[]],
        isCorrect: false,
        hadTypos: false,
      })),
    }
  })
  // At the end so stats are recalculated correctly
  setLocal("wordNum", 0)
  setLocal("charNum", 0)
}
