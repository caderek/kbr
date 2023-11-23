export function countAllNgrams(words, ngramSize) {
  return words.reduce((sum, word) => sum + (word.length - ngramSize + 1), 0)
}
