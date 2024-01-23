export function joinWordlists(...wordlists) {
  return [...new Set(wordlists.flat())]
}
