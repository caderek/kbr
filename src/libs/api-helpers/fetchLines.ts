export async function fetchLines(path: string) {
  const res = await fetch(path)

  if (!res.ok) {
    return null
  }

  try {
    const content = await res.text()
    return content
      .trim()
      .split("\n")
      .map((p) => p + "⏎")
  } catch (e) {
    console.error(e)
    return null
  }
}
