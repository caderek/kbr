import { produce, type SetStoreFunction } from "solid-js/store"
import type { LocalState } from "../types"

export function handleParagraphReset(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  console.log("paragraph reset")

  setLocal("typed", local.paragraphNum, (prev) =>
    prev.map((word) => new Array(word.length).fill(null)),
  )
  setLocal("stats", local.paragraphNum, (prev) => {
    return {
      ...prev,
      correctCharCount: 0,
      wpm: null,
      acc: null,
      consistency: null,
      time: 0,
      inputTimes: [],
      startTime: 0,
      endTime: 0,
      totalTime: 0,
      typos: 0,
      nonTypos: 0,
      words: local.original[local.paragraphNum].map((chars) => ({
        length: chars.length,
        typedLength: 0,
        times: [[]],
        isCorrect: true,
        hadTypos: false,
        typosIndicies: [],
      })),
    }
  })
  // At the end so stats are recalculated correctly
  setLocal(
    produce((state) => {
      state.wordNum = 0
      state.charNum = 0
    }),
  )

  console.log(local.stats[local.paragraphNum])
}
