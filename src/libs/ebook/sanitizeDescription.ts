export function sanitizeDescription(description: string | null) {
  if (description === null) {
    return []
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(
    `<html><body>${description}</body></html>`,
    "text/html",
  )

  console.log("--- DESCRIPTION DOCUMENT ---")
  console.log(document)

  if (document.body.textContent === description) {
    return [description].filter(Boolean)
  }

  const paragraphs = document.querySelectorAll("p")

  if (paragraphs.length === 0) {
    return [document.body.textContent as string].filter(Boolean)
  }

  return [...paragraphs]
    .map((paragraph) => paragraph.textContent)
    .filter((p) => typeof p === "string" && p !== "") as string[]
}
