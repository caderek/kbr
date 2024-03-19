import config from "../../../../config.ts"
import { calculateWeightedAverage } from "../../../../utils/math.ts"
import { calculateConsistency } from "./calculateConsistency.ts"

export function calculateParagraphConsistency(
  inputTimes: number[],
  paragraphLength: number,
  consistency: number | null,
) {
  const timeDiffs = []

  for (let i = 0; i < inputTimes.length - 1; i++) {
    const diff = inputTimes[i + 1] - inputTimes[i]
    timeDiffs.push(diff >= config.AFK_BOUNDRY ? 1000 : diff)
  }

  const currentConsistency = calculateConsistency(timeDiffs)

  return consistency === null
    ? currentConsistency
    : // If user goes back to already finished paragraph,
      // try to estimate proportional change to consistency
      calculateWeightedAverage(
        [consistency, currentConsistency],
        [1, Math.min(1, inputTimes.length / paragraphLength)],
      )
}
