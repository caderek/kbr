import type { SetStoreFunction } from "solid-js/store"
import type { LocalState } from "../types.ts"
import { formatPercentage } from "../../../../utils/formatters.ts"
import { calculateAccuracy } from "../prompt-util/calculateAccuracy.tsx"
import { calculateParagraphWpm } from "../prompt-util/calculateParagraphWpm.tsx"
import { calculateParagraphConsistency } from "../prompt-util/calculateParagraphConsistency.tsx"

export function setParagraphStats(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  setLocal("paused", true)
  const acc = calculateAccuracy(
    local.stats[local.paragraphNum].nonTypos,
    local.stats[local.paragraphNum].typos,
  )
  const { wpm, start, end, time, charsCount } = calculateParagraphWpm(
    local.stats[local.paragraphNum].inputTimes,
    local.stats[local.paragraphNum].words,
    local.stats[local.paragraphNum].totalTime,
  )

  const { consistency, totalKeystrokes } = calculateParagraphConsistency(
    local.stats[local.paragraphNum].inputTimes,
    local.stats[local.paragraphNum].totalKeystrokes,
    local.stats[local.paragraphNum].consistency,
  )

  console.log({ consistency: formatPercentage(consistency) })

  setLocal("stats", local.paragraphNum, "acc", acc)
  setLocal("stats", local.paragraphNum, "wpm", wpm)
  setLocal("stats", local.paragraphNum, "consistency", consistency)
  setLocal("stats", local.paragraphNum, "totalKeystrokes", totalKeystrokes)
  setLocal("stats", local.paragraphNum, "startTime", start)
  setLocal("stats", local.paragraphNum, "endTime", end)
  setLocal("stats", local.paragraphNum, "totalTime", time)
  setLocal("stats", local.paragraphNum, "correctCharCount", charsCount)

  // save paragraph stats
}
