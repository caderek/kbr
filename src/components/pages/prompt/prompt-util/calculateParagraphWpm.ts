import { calculateWpm } from "./calculateWpm.ts"
import { getAfkTime } from "./getAfkTime.ts"
import { WordStats } from "../types.ts"

export function calculateParagraphWpm(
  inputTimes: number[],
  wordsStats: WordStats[],
  prevTime: number,
) {
  const afkTime = getAfkTime(inputTimes)
  const start = inputTimes[0]
  const end = inputTimes[inputTimes.length - 1]
  const time = end - start - afkTime + prevTime

  let charCount = 0
  let weight = 0

  // @ts-ignore
  const lastTypedIndex = wordsStats.findLastIndex(
    // @ts-ignore
    (stats) => stats.typedLength > 0,
  )

  for (let i = 0; i <= lastTypedIndex; i++) {
    weight += wordsStats[i].typedLength || wordsStats[i].length

    if (wordsStats[i].isCorrect) {
      charCount += wordsStats[i].typedLength || wordsStats[i].length
    }
  }

  return {
    wpm: {
      value: calculateWpm(time, charCount),
      raw: calculateWpm(time, weight),
      weight,
    },
    time,
  }
}
