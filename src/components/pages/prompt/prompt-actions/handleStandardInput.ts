import { SetStoreFunction, produce } from "solid-js/store"
import { LocalState } from "../types"
import config from "../../../../config"
import { setParagraphStats } from "./setParagraphStats"
import { getScreenSplitOffsets } from "../prompt-util/getScreenSplitOffsets"

let afkTimeout: NodeJS.Timeout | null = null

export function handleStandardInput(
  e: KeyboardEvent,
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  const expectedChar =
    local.original[local.paragraphNum][local.wordNum][local.charNum]

  if (expectedChar === "⏎" && e.key !== "Enter") {
    // TODO indicate that the user has to press enter to end the paragraph
    return
  }

  let char

  if (e.key === "Enter") {
    // Treat enter as line end if at the end of a paragraph,space otherwise
    // (to prevent annoying typo when the paragraph wraps and user don't realize space is required).
    char = expectedChar === "⏎" ? "⏎" : " "
  } else {
    // If the expected character is not in the current charset, accept any key
    char = local.charset.has(expectedChar) ? e.key : expectedChar
  }

  const inputTime = performance.now()

  setLocal("pageStats", "inputTimes", (prev) => [...prev, inputTime])
  setLocal("stats", local.paragraphNum, "inputTimes", (prev) => [
    ...prev,
    inputTime,
  ])
  setLocal(
    "stats",
    local.paragraphNum,
    "words",
    local.wordNum,
    "times",
    local.stats[local.paragraphNum].words[local.wordNum].times.length - 1,
    (prev) => [...prev, inputTime], // TODO prev is not iterable!
  )

  if (char !== expectedChar) {
    setLocal("stats", local.paragraphNum, "typos", (prev) => prev + 1)
    setLocal(
      "stats",
      local.paragraphNum,
      "words",
      local.wordNum,
      "hadTypos",
      true,
    )

    setLocal(
      "stats",
      local.paragraphNum,
      "words",
      local.wordNum,
      "typosIndicies",
      (prev) => [...prev, local.charNum],
    )
    // TODO MARK TYPOS POSITIONS
  } else if (char !== "⏎") {
    setLocal("stats", local.paragraphNum, "nonTypos", (prev) => prev + 1)
  }

  setLocal("typed", local.paragraphNum, local.wordNum, local.charNum, char)
  setLocal(
    "stats",
    local.paragraphNum,
    "words",
    local.wordNum,
    "typedLength",
    local.charNum + 1,
  )
  setLocal("paused", false)
  setLocal("hideCursor", true)

  if (afkTimeout !== null) {
    clearTimeout(afkTimeout)
  }

  afkTimeout = setTimeout(() => {
    setLocal("paused", true)
  }, config.AFK_BOUNDRY)

  // Mark if partial (or full) word is correct
  setLocal(
    "stats",
    local.paragraphNum,
    "words",
    local.wordNum,
    "isCorrect",
    local.original[local.paragraphNum][local.wordNum]
      .join("")
      .startsWith(local.typed[local.paragraphNum][local.wordNum].join("")),
  )

  // PARAGRAPH END
  if (expectedChar === "⏎") {
    setParagraphStats(local, setLocal)

    const splitOffsets = getScreenSplitOffsets(
      local.screenSplits,
      local.paragraphNum,
    )

    if (local.splitStart !== splitOffsets.start) {
      setLocal(
        produce((state) => {
          state.splitStart = splitOffsets.start
          state.splitEnd = splitOffsets.end
        }),
      )
    }
  }

  const isLastChar =
    local.charNum ===
    local.original[local.paragraphNum][local.wordNum].length - 1
  const isLastWord =
    isLastChar && local.wordNum === local.typed[local.paragraphNum].length - 1
  const isLastParagraph =
    isLastWord && local.paragraphNum === local.typed.length - 1

  if (isLastParagraph) {
    console.log("Page done!")
    setLocal("done", true)

    // Remove when there is summary page or next page mechanism
    setLocal("charNum", local.charNum + 1)

    console.log(local)
  } else if (isLastWord) {
    setLocal(
      produce((state) => {
        state.charNum = 0
        state.wordNum = 0
        state.paragraphNum += 1
      }),
    )
  } else if (isLastChar) {
    setLocal(
      produce((state) => {
        state.charNum = 0
        state.wordNum += 1
      }),
    )
  } else {
    setLocal("charNum", local.charNum + 1)
  }
}
