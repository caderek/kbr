import { getWordNgrams } from "./getWordNgrams.js"

export function getSpecificNgramsWithCount(words, ngramSize, minCount = 1) {
  const ngramsWithCount = new Map()

  for (const word of words) {
    if (word.length < ngramSize) {
      continue
    }

    const ngrams = getWordNgrams(word, ngramSize)

    for (const ngram of ngrams) {
      ngramsWithCount.set(ngram, (ngramsWithCount.get(ngram) ?? 0) + 1)
    }
  }

  const sorted = [...ngramsWithCount.entries()]
    .filter(([_, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])

  return sorted
}

export function getSpecificNgrams(words, ngramSize, minCount = 1) {
  const ngrams = getSpecificNgramsWithCount(words, ngramSize, minCount).map(
    ([ngram]) => ngram,
  )

  return new Set(ngrams)
}
