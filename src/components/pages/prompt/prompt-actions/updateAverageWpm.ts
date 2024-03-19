import { SetStoreFunction } from "solid-js/store"
import { LocalState } from "../types"
import { calculateParagraphWpm } from "../prompt-util/calculateParagraphWpm"
import config from "../../../../config"
import { calculateWpm } from "../prompt-util/calculateWpm"

export function updateAverageWpm(
  local: LocalState,
  setLocal: SetStoreFunction<LocalState>,
) {
  return (prev: string) => {
    const label = `${local.paragraphNum}${local.wordNum}`

    if (label !== prev || local.done) {
      let totalTime = 0
      let totalCorrectCharsCount = 0
      let prevEndTime = 0

      for (const [paragraphNum, paragraphStats] of local.stats.entries()) {
        if (
          paragraphNum === local.paragraphNum &&
          paragraphStats.inputTimes.length > 1
        ) {
          const paragraphWpm = calculateParagraphWpm(
            paragraphStats.inputTimes,
            paragraphStats.words,
            0,
          )

          totalTime += paragraphWpm.time
          totalCorrectCharsCount += paragraphWpm.charsCount

          if (paragraphNum !== 0) {
            const timeBetweenParagraphs = paragraphWpm.start - prevEndTime
            totalTime +=
              timeBetweenParagraphs >= config.AFK_BOUNDRY
                ? config.AFK_PENALTY
                : timeBetweenParagraphs
          }
        }

        if (paragraphNum === local.paragraphNum) {
          break
        }

        totalTime += paragraphStats.totalTime
        totalCorrectCharsCount += paragraphStats.correctCharCount

        if (paragraphNum !== 0) {
          const timeBetweenParagraphs = paragraphStats.startTime - prevEndTime
          totalTime +=
            timeBetweenParagraphs >= config.AFK_BOUNDRY
              ? config.AFK_PENALTY
              : timeBetweenParagraphs
        }

        prevEndTime = paragraphStats.endTime
      }

      const wpm = calculateWpm(totalTime, totalCorrectCharsCount)

      if (!Number.isNaN(wpm)) {
        setLocal("pageStats", "wpm", wpm)
      }

      return label
    }

    return prev
  }
}
