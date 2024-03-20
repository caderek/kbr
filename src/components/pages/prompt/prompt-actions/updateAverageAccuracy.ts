import { SetStoreFunction } from "solid-js/store"
import { LocalState } from "../types"
import { calculateParagraphAccuracy } from "../prompt-util/calculateParagraphAccuracy"
import { calculateWeightedAverage } from "../../../../utils/math"

export function updateAverageAccuracy(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  return () => {
    if (local.stats.length === 0) {
      return
    }

    console.log("Updating average acc")

    const accuracies = []
    const weights = []

    for (let i = 0; i < local.paragraphNum; i++) {
      accuracies.push(local.stats[i].acc as number)
      weights.push(local.stats[i].charCount)
    }

    const currentParagraph = local.stats[local.paragraphNum]

    if (currentParagraph.inputTimes.length > 0) {
      const { acc, charsCount } = calculateParagraphAccuracy(currentParagraph)
      accuracies.push(acc)
      weights.push(charsCount)
    }

    const averageAcc = calculateWeightedAverage(accuracies, weights)
    setLocal("pageStats", "acc", averageAcc)
  }
}
