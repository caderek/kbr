export function calculateAccuracy(nonTypos: number, typos: number) {
  return nonTypos / (typos + nonTypos)
}
