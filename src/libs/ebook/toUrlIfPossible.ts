function isUrl(text: string) {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}

export function toUrlIfPossible(text: string | null) {
  if (text === null) {
    return null
  }

  text = text.startsWith("www.") ? `https://${text}` : text

  return {
    isUrl: isUrl(text),
    value: text,
  }
}
