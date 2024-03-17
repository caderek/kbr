import { calculateWpm } from "./calculateWpm.tsx"
import { getAfkTime } from "./getAfkTime.tsx"
import { WordStats } from "../types.ts"

export function calculateParagraphWpm(
  inputTimes: number[],
  stats: WordStats[],
) {
  const afkTime = getAfkTime(inputTimes)
  const start = inputTimes[0]
  const end = inputTimes[inputTimes.length - 1]
  const time = end - start - afkTime

  let charsCount = 0

  for (const wordStats of stats) {
    if (wordStats.typedLength === 0) {
      break
    }

    if (wordStats.isCorrect) {
      charsCount += wordStats.typedLength
    }
  }

  return { wpm: calculateWpm(time, charsCount), start, end, time, charsCount }
}
