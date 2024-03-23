import {
  calculateVariationCoefficient,
  removeOutliersByPercentiles,
  // removeOutliersByStandardDeviations,
} from "../../../../utils/math"

export function calculateConsistency(arr: number[]) {
  const withoutOutliers = removeOutliersByPercentiles(arr)

  if (withoutOutliers.length < 2) {
    return 1
  }

  return 1 - calculateVariationCoefficient(withoutOutliers)
}
