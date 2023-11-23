import { countAllNgrams } from "./countAllNgrams.js"

export function calculateNgramDensity(words, ngrams, ngramSize) {
  const maxCapacity = countAllNgrams(words, ngramSize)
  return ngrams.size / maxCapacity
}
