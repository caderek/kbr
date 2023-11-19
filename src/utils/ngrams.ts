export function getNgrams(words: string[], ngramLength: number) {
  const ngrams = new Set<string>()

  for (const word of words) {
    if (word.length < ngramLength) {
      continue
    }

    for (let i = 0; i <= word.length - ngramLength; i++) {
      ngrams.add(word.slice(i, i + ngramLength))
    }
  }

  return ngrams
}
