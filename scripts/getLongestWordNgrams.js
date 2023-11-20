export function getLongestWordNgrams(word, maxNgram) {
  const ngrams = []

  const ngramSize = Math.min(word.length, maxNgram)

  for (let i = 0; i <= word.length - ngramSize; i++) {
    const ngram = word.slice(i, i + ngramSize)

    ngrams.push(ngram)
  }

  return new Set(ngrams)
}
