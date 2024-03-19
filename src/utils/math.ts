export function calculateMean(arr: number[]) {
  const sum = arr.reduce((acc, curr) => acc + curr, 0)
  return sum / arr.length
}

export function calculateVariance(arr: number[], mean: number) {
  const squaredDifferences = arr.map((value) => (value - mean) ** 2)
  const sumOfSquaredDifferences = squaredDifferences.reduce(
    (acc, curr) => acc + curr,
    0,
  )
  return sumOfSquaredDifferences / arr.length
}

export function calculateStandardDeviation(arr: number[], mean: number) {
  const variance = calculateVariance(arr, mean)
  return Math.sqrt(variance)
}

export function calculateVariationCoefficient(arr: number[]) {
  const mean = calculateMean(arr)
  const standardDeviation = calculateStandardDeviation(arr, mean)
  return standardDeviation / mean
}

export function calculateWeightedAverage(values: number[], weights: number[]) {
  if (values.length !== weights.length) {
    throw new Error("Input arrays must have the same length.")
  }

  const [sum, weightSum] = weights.reduce(
    (acc, weight, i) => {
      const weightedValue = values[i] * weight
      acc[0] += weightedValue
      acc[1] += weight
      return acc
    },
    [0, 0],
  )

  return sum / weightSum
}
