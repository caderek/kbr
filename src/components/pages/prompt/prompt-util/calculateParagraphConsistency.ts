import config from "../../../../config.ts"
import { calculateWeightedAverage } from "../../../../utils/math.ts"
import { calculateConsistency } from "./calculateConsistency.ts"

export function calculateParagraphConsistency(
  inputTimes: number[],
  prevConsistency: { value: number; weight: number } | null,
) {
  const timeDiffs = []

  for (let i = 0; i < inputTimes.length - 1; i++) {
    const diff = inputTimes[i + 1] - inputTimes[i]
    timeDiffs.push(diff >= config.AFK_BOUNDRY ? 1000 : diff)
  }

  const weight = inputTimes.length
  const currentValue = calculateConsistency(timeDiffs)

  const updatedConsistency =
    prevConsistency === null
      ? currentValue
      : calculateWeightedAverage(
          [prevConsistency.value, currentValue],
          [prevConsistency.weight, weight],
        )

  return {
    value: updatedConsistency,
    weight: (prevConsistency?.weight ?? 0) + weight,
  }
}
