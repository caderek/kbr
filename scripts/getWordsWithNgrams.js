import { getLongestWordNgrams } from "./getLongestWordNgrams.js"

export function getWordsWithNgrams({
  words,
  ngrams,
  maxNgram,
  maxWords,
  allowAdditionalNgrams,
}) {
  maxWords ??= Infinity
  allowAdditionalNgrams ??= true

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
      items.push({ word, ngrams: wordNgrams })
    }
  }

  while (items.length && list.length < maxWords) {
    const byNgramsCountThenByShortest = items.sort(
      (a, b) => b.ngrams.size - a.ngrams.size || a.word.length - b.word.length,
    )

    const best = byNgramsCountThenByShortest[0]
    list.push(best.word)
    items = byNgramsCountThenByShortest.slice(1)

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
