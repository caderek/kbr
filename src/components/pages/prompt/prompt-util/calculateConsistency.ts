import { calculateVariationCoefficient } from "../../../../utils/math"

export function calculateConsistency(arr: number[]) {
  if (arr.length < 2) {
    return 1
  }

  return 1 - calculateVariationCoefficient(arr)
}
