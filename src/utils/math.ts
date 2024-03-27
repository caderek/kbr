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

export function removeOutliersByStandardDeviations(
  arr: number[],
  standardDeviationsCutoff: number = 1,
) {
  const mean = calculateMean(arr)
  const standardDeviation = calculateStandardDeviation(arr, mean)

  return arr.filter((num) => {
    const standardDeviationsFromMean = Math.abs(mean - num) / standardDeviation
    return standardDeviationsFromMean <= standardDeviationsCutoff
  })
}

export function removeOutliersByPercentiles(
  arr: number[],
  startPercentile: number = 10,
  endPercentile: number = 90,
) {
  const sortedArray = arr.slice().sort((a, b) => a - b)

  const index10th = Math.floor(
    (startPercentile / 100) * (sortedArray.length - 1),
  )
  const index90th = Math.floor((endPercentile / 100) * (sortedArray.length - 1))

  return sortedArray.slice(index10th, index90th + 1)
}

export function calculateWeightedAverage(values: number[], weights: number[]) {
  if (values.length !== weights.length) {
    throw new Error("Input arrays must have the same length.")
  }

  if (values.length === 1) {
    return values[0]
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

export function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  values = [...values].sort((a, b) => a - b)

  const half = Math.floor(values.length / 2)

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2
}

export function mod(num: number, modulus: number) {
  return ((num % modulus) + modulus) % modulus
}
