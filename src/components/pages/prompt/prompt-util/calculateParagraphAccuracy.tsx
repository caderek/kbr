import { ParagraphStats } from "../types.ts"
import { calculateAccuracy } from "./calculateAccuracy.tsx"

export function calculateParagraphAccuracy(stats: ParagraphStats) {
  return {
    acc: calculateAccuracy(stats.nonTypos, stats.typos),
    charsCount: stats.nonTypos + stats.typos,
  }
}
