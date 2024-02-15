export function getLanguage(label?: string) {
  if (!label) {
    return null
  }

  try {
    return new Intl.Locale(label.replace(/\s+/g, "-")).language
  } catch {
    return null
  }
}
