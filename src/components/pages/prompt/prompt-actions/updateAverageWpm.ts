import { SetStoreFunction } from "solid-js/store"
import { LocalState } from "../types"
import { calculateParagraphWpm } from "../prompt-util/calculateParagraphWpm"
import { calculateWeightedAverage } from "../../../../utils/math"

export function updateAverageWpm(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  return () => {
    if (local.stats.length === 0) {
      return
    }
    console.log("Updating average wpm")

    const wpms = []
    const weights = []

    for (let i = 0; i < local.paragraphNum; i++) {
      wpms.push(local.stats[i].wpm as number)
      weights.push(local.stats[i].charCount)
    }

    const currentParagraph = local.stats[local.paragraphNum]

    if (currentParagraph.inputTimes.length > 0) {
      const { wpm, charsCount } = calculateParagraphWpm(
        currentParagraph.inputTimes,
        currentParagraph.words,
        currentParagraph.totalTime,
      )
      wpms.push(wpm)
      weights.push(charsCount)
    }

    const averageWpm = calculateWeightedAverage(wpms, weights)
    setLocal("pageStats", "wpm", averageWpm)
  }
}
