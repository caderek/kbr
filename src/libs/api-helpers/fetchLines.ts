export async function fetchLines(path: string) {
  const res = await fetch(path)

  if (!res.ok) {
    return null
  }

  try {
    return (await res.text()).split("\n").map((p) => p + "⏎")
  } catch (e) {
    console.error(e)
    return null
  }
}
