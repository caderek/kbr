export function cleanWordlist(words) {
  const cleaned = words
    .map((word) => word.toLowerCase().split(/[-'\s]+/))
    .flat()
    .filter((word) => word.length > 1)

  return [...new Set(cleaned)]
}
