import type { SetStoreFunction } from "solid-js/store"
import type { LocalState } from "../types"
import state from "../../../../state/state"

export function handleBackspace(
  e: KeyboardEvent,
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  const isFirstParagraph = local.paragraphNum === 0
  const isFirstWord = local.wordNum === 0
  const isFirstChar = local.charNum === 0

  if (isFirstParagraph && isFirstWord && isFirstChar) {
    return
  }

  if (
    (e.ctrlKey && !state.get.settings.backspaceWholeWord) ||
    (!e.ctrlKey && state.get.settings.backspaceWholeWord)
  ) {
    // Delete whole word
    if (isFirstWord && isFirstChar) {
      setLocal("paragraphNum", local.paragraphNum - 1)
      setLocal("wordNum", local.typed[local.paragraphNum].length - 1)
      setLocal("charNum", 0)
    } else if (isFirstChar) {
      setLocal("wordNum", local.wordNum - 1)
      setLocal("charNum", 0)
    } else {
      setLocal("charNum", 0)
    }

    setLocal("typed", local.paragraphNum, local.wordNum, (prev) =>
      [...prev].fill(null),
    )
  } else {
    // Delete single character
    if (isFirstWord && isFirstChar) {
      setLocal("paragraphNum", local.paragraphNum - 1)
      setLocal("wordNum", local.typed[local.paragraphNum].length - 1)
      setLocal(
        "charNum",
        local.typed[local.paragraphNum][local.wordNum].length - 1,
      )
    } else if (isFirstChar) {
      setLocal("wordNum", local.wordNum - 1)
      setLocal(
        "charNum",
        local.typed[local.paragraphNum][local.wordNum].length - 1,
      )
    } else {
      setLocal("charNum", local.charNum - 1)
    }

    setLocal("typed", local.paragraphNum, local.wordNum, local.charNum, null)
  }
}
