import { SetStoreFunction } from "solid-js/store"
import { LocalState } from "../types"

export function updateProgress(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  return () => {
    const lengthCompleted =
      local.incrementalLength?.[local.paragraphNum]?.[local.wordNum] ?? 0

    setLocal("lengthCompleted", lengthCompleted)
  }
}
