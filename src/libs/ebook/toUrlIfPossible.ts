export function toUrlIfPossible(text: string | null) {
  if (text === null) {
    return null
  }

  try {
    return new URL(text)
  } catch {
    return text
  }
}
