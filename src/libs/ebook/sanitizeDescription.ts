export function sanitizeDescription(
  description: string | null,
  clean: (text: string) => string,
) {
  if (description === null) {
    return null
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(
    `<html><body>${description}</body></html>`,
    "text/html",
  )

  console.log("--- DESCRIPTION DOCUMENT ---")
  console.log(document)

  if (document.body.textContent === description) {
    return [description].filter(Boolean).map(clean)
  }

  const paragraphs = document.querySelectorAll("p")

  if (paragraphs.length === 0) {
    return [document.body.textContent as string].filter(Boolean).map(clean)
  }

  return (
    [...paragraphs]
      .map((paragraph) => paragraph.textContent)
      .filter((p) => typeof p === "string" && p !== "") as string[]
  ).map(clean)
}
