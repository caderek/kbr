import { SetStoreFunction } from "solid-js/store"
import { LocalState } from "../types"
import { calculateAccuracy } from "../prompt-util/calculateAccuracy"

export function updateAverageAccuracy(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  return () => {
    if (local.stats.length === 0) {
      return
    }

    const { nonTypos, typos } = local.stats.reduce(
      (sums, parStats) => {
        sums.nonTypos += parStats.nonTypos
        sums.typos += parStats.typos
        return sums
      },
      { nonTypos: 0, typos: 0 },
    )

    if (nonTypos > 0 || typos > 0) {
      setLocal("pageStats", "acc", calculateAccuracy(nonTypos, typos))
    }
  }
}
