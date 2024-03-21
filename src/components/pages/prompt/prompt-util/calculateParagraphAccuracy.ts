import { calculateWeightedAverage } from "../../../../utils/math.ts"
import { calculateAccuracy } from "./calculateAccuracy.ts"

export function calculateParagraphAccuracy(
  nonTypos: number,
  typos: number,
  prevAccuracy: { value: number; weight: number } | null,
) {
  const weight = nonTypos + typos
  const currentValue = calculateAccuracy(nonTypos, typos)

  const updatedAccuracy =
    prevAccuracy === null
      ? currentValue
      : calculateWeightedAverage(
          [prevAccuracy.value, currentValue],
          [prevAccuracy.weight, weight],
        )

  return {
    value: updatedAccuracy,
    weight: (prevAccuracy?.weight ?? 0) + weight,
  }
}
