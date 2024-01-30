export function getFileType(mime: string) {
  if (mime.includes("html")) {
    return "html"
  }

  if (mime.startsWith("image")) {
    return "image"
  }

  if (mime.includes("text")) {
    return "text"
  }

  if (mime.includes("xml")) {
    return "xml"
  }

  return "other"
}
