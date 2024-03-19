import config from "../../../../config.ts"
import { calculateWeightedAverage } from "../../../../utils/math.ts"
import { calculateConsistency } from "./calculateConsistency.ts"

export function calculateParagraphConsistency(
  inputTimes: number[],
  totalKeystrokes: number,
  consistency: number | null,
) {
  const timeDiffs = []

  for (let i = 0; i < inputTimes.length - 1; i++) {
    const diff = inputTimes[i + 1] - inputTimes[i]
    timeDiffs.push(diff >= config.AFK_BOUNDRY ? 1000 : diff)
  }

  const currentConsistency = calculateConsistency(timeDiffs)

  const updatedConsistency =
    consistency === null
      ? currentConsistency
      : // If user goes back to already finished paragraph,
        // calculate proportional change to consistency
        calculateWeightedAverage(
          [consistency, currentConsistency],
          [1, Math.min(1, inputTimes.length / totalKeystrokes)],
        )

  return {
    consistency: updatedConsistency,
    totalKeystrokes: totalKeystrokes + inputTimes.length,
  }
}
