import { getLongestWordNgrams } from "./getLongestWordNgrams.js"

export function getLongestNgrams(words, maxNgram, minCount = 1) {
  const ngramsWithCount = new Map()

  for (const word of words) {
    const ngrams = getLongestWordNgrams(word, maxNgram)
    const ngramSize = [...ngrams][0].length

    if (!ngramsWithCount.has(ngramSize)) {
      ngramsWithCount.set(ngramSize, new Map())
    }

    for (const ngram of ngrams) {
      ngramsWithCount
        .get(ngramSize)
        .set(ngram, (ngramsWithCount.get(ngram) ?? 0) + 1)
    }
  }

  const usedNgrams = []
  const joined = new Map()

  const ngramsWithCountFromLongest = [...ngramsWithCount.entries()].sort(
    ([a], [b]) => b - a,
  )

  for (const [_, counts] of ngramsWithCountFromLongest) {
    for (const [ngram, count] of counts.entries()) {
      const usedNgram = usedNgrams.find((x) => x.includes(ngram))

      if (usedNgram) {
        joined.set(usedNgram, joined.get(usedNgram) + count)
        continue
      }

      joined.set(ngram, count)
      usedNgrams.push(ngram)
    }
  }

  const sorted = [...joined.entries()]
    .filter(([_, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([ngram]) => ngram)

  return new Set(sorted)
}
