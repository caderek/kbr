export async function fetchJSON(path: string) {
  const res = await fetch(path)

  if (!res.ok) {
    return null
  }

  try {
    return res.json()
  } catch (e) {
    console.error(e)
    return null
  }
}
