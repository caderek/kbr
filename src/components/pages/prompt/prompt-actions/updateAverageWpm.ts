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

    const wpms: number[] = []
    const weights: number[] = []

    for (let i = 0; i < local.paragraphNum; i++) {
      if (local.stats[i].wpm === null) {
        continue
      }

      wpms.push(local.stats[i].wpm!.value)
      weights.push(local.stats[i].wpm!.weight)
    }

    const currentParagraph = local.stats[local.paragraphNum]

    if (currentParagraph.inputTimes.length > 0) {
      const wpm = calculateParagraphWpm(
        currentParagraph.inputTimes,
        currentParagraph.words,
        currentParagraph.wpm,
      )
      wpms.push(wpm.value)
      weights.push(wpm.weight)
    }

    const averageWpm = calculateWeightedAverage(wpms, weights)

    if (!Number.isNaN(averageWpm)) {
      setLocal("pageStats", "wpm", averageWpm)
    }
  }
}
