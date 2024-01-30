export function cleanText(text: string) {
  return text
    .trim()
    .replace(/\n+/g, " ")
    .replace("THE FULL PROJECT GUTENBERG LICENSE", "") // removes empty page at the end of PG books
    .replace(/[’‘]/g, "'")
    .replace(/[—–]/g, " - ")
    .replace(/[…]/g, "...")
    .replace(/[“”]/g, '"')
    .replace(/[œ]/g, "oe")
    .replace(/\s+/g, " ")
}
