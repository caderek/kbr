export function getWordNgrams(word, ngramSize) {
  const ngrams = []

  for (let i = 0; i <= word.length - ngramSize; i++) {
    const ngram = word.slice(i, i + ngramSize)
    ngrams.push(ngram)
  }

  return new Set(ngrams)
}
