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

    const accuracies = []
    const weights = []

    for (let i = 0; i < local.paragraphNum; i++) {
      accuracies.push(local.stats[i].acc?.value ?? 0)
      weights.push(local.stats[i].acc?.weight ?? 0)
    }

    const currentParagraph = local.stats[local.paragraphNum]

    if (currentParagraph.inputTimes.length > 0) {
      const acc = calculateParagraphAccuracy(
        currentParagraph.nonTypos,
        currentParagraph.typos,
        currentParagraph.acc,
      )
      accuracies.push(acc.value)
      weights.push(acc.weight)
    }

    const averageAcc = calculateWeightedAverage(accuracies, weights)

    if (!Number.isNaN(averageAcc)) {
      setLocal("pageStats", "acc", averageAcc)
    }
  }
}
