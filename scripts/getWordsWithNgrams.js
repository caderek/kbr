import { getLongestWordNgrams } from "./getLongestWordNgrams.js"

export function getWordsWithNgrams({
  words,
  ngrams,
  maxNgram,
  maxWords,
  allowAdditionalNgrams,
  avoidWords,
}) {
  maxWords ??= Infinity
  allowAdditionalNgrams ??= true
  const avoid = new Set(avoidWords ?? [])

  const ngramsCopy = new Set([...ngrams])
  const list = []
  let items = []

  for (const word of words) {
    const allWordNgrams = getLongestWordNgrams(word, maxNgram)

    if (
      !allowAdditionalNgrams &&
      [...allWordNgrams].some((n) => !ngramsCopy.has(n))
    ) {
      continue
    }

    const wordNgrams = new Set(
      [...allWordNgrams].filter((ngram) => ngramsCopy.has(ngram)),
    )

    if (wordNgrams.size > 0 && (allowAdditionalNgrams || 1)) {
      items.push({
        word,
        ngrams: wordNgrams,
        priority: avoid.has(word) ? 0 : 1,
      })
    }
  }

  while (items.length && list.length < maxWords) {
    const sorted = items.sort(
      (a, b) =>
        b.priority - a.priority || // by priority
        b.ngrams.size - a.ngrams.size || // then by number of ngrams
        a.word.length - b.word.length, // then by word length
    )

    const best = sorted[0]
    list.push(best.word)
    items = sorted.slice(1)

    for (const used of best.ngrams) {
      ngramsCopy.delete(used)
    }

    for (const item of items) {
      for (const used of best.ngrams) {
        item.ngrams.delete(used)
      }
    }

    items = items.filter(({ ngrams }) => ngrams.size > 0)
  }

  return list
}
