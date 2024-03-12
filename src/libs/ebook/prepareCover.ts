import type { Info } from "./types"

const TITLE_CHARS_PER_LINE = 10
const TITLE_MAX_LINES = 5
const AUTHOR_CHARS_PER_LINE = 20
const AUTHOR_MAX_LINES = 3

function getCoverColors(genres: Set<string>) {
  if (genres.has("children")) {
    return { bg: "#9AAD3E", fg: "#033547" }
  }

  if (genres.has("young-adult")) {
    return { bg: "#37264D", fg: "#ACFFAD" }
  }

  if (genres.has("horror")) {
    return { bg: "#141019", fg: "#EE1919" }
  }

  if (genres.has("mystery") || genres.has("crime") || genres.has("thriller")) {
    return { bg: "#151722", fg: "#C4C4C4" }
  }

  if (genres.has("fantasy")) {
    return { bg: "#361A4D", fg: "#FEC260" }
  }

  if (genres.has("science-fiction")) {
    return { bg: "#131B2A", fg: "#A5FB38" }
  }

  if (genres.has("adventure")) {
    return { bg: "#18291F", fg: "#FFCA42" }
  }

  if (genres.has("romance") || genres.has("erotic")) {
    return { bg: "#261E2B", fg: "#FF2E63" }
  }

  if (genres.has("drama") || genres.has("poetry")) {
    return { bg: "#331D2C", fg: "#EFE1D1" }
  }

  if (genres.has("comedy")) {
    return { bg: "#4E1839", fg: "#FB8B24" }
  }

  if (genres.has("satire")) {
    return { bg: "#272121", fg: "#FF4D00" }
  }

  if (genres.has("philosophy") || genres.has("spirituality")) {
    return { bg: "#1F2544", fg: "#FFD0EC" }
  }

  if (
    genres.has("biography") ||
    genres.has("autobiography") ||
    genres.has("memoir")
  ) {
    return { bg: "#2D2424", fg: "#E0C097" }
  }

  if (genres.has("history")) {
    return { bg: "#2C1A1C", fg: "#DB8A3A" }
  }

  if (genres.has("fiction")) {
    return { bg: "#222831", fg: "#00ADB5" }
  }

  if (genres.has("nonfiction")) {
    return { bg: "#222831", fg: "#FFD369" }
  }

  return { bg: "#222831", fg: "#CBE4DE" }
}

async function loadImage(url: string) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve(img)
  }) as Promise<HTMLImageElement>
}

function drawText(
  ctx: CanvasRenderingContext2D,
  rawTitle: string,
  lineHeight: number,
  charsPerLine: number,
  baseY: number,
  maxLines: number,
) {
  const maxChars = Math.max(
    charsPerLine,
    Math.ceil(rawTitle.length / maxLines) + 1,
  )

  const title =
    rawTitle.length <= maxChars
      ? [rawTitle]
      : rawTitle.split(" ").reduce((chunks, word) => {
          if (chunks.length === 0) {
            chunks.push(word)
          } else if (
            (chunks.at(-1) ?? "").length + word.length + 1 <=
            maxChars
          ) {
            chunks[chunks.length - 1] += ` ${word}`
          } else {
            chunks.push(word)
          }
          return chunks
        }, [] as string[])

  const isOddLines = title.length % 2 !== 0
  const start =
    baseY -
    Math.floor(title.length / 2) * lineHeight +
    (isOddLines ? 0 : lineHeight / 2)

  for (const [i, chunk] of title.entries()) {
    const y = start + i * lineHeight

    ctx.fillText(
      chunk.toUpperCase(),
      ctx.canvas.width / 2,
      y,
      Math.floor(0.775 * ctx.canvas.width),
    )
  }
}

function drawCover(ctx: CanvasRenderingContext2D, info: Info) {
  const TITLE_LINE_HEIGHT = Math.floor(0.125 * ctx.canvas.width)
  const AUTHOR_LINE_HEIGHT = Math.floor(0.075 * ctx.canvas.width)
  const WIDTH = ctx.canvas.width
  const colors = getCoverColors(new Set(info.genres))

  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.strokeStyle = colors.fg
  ctx.lineWidth = Math.round((WIDTH * 2) / 320)
  ctx.strokeRect(
    0.05 * WIDTH,
    0.05 * WIDTH,
    ctx.canvas.width - 0.1 * WIDTH,
    ctx.canvas.height - 0.1 * WIDTH,
  )

  ctx.textAlign = "center"

  ctx.font = `bold ${Math.floor(0.12 * WIDTH)}px 'Times New Roman'`
  ctx.fillStyle = colors.fg

  const rawTitle = info.title ?? "No Title"

  drawText(
    ctx,
    rawTitle,
    TITLE_LINE_HEIGHT,
    TITLE_CHARS_PER_LINE,
    ctx.canvas.height / 2,
    TITLE_MAX_LINES,
  )

  ctx.font = `bold ${Math.floor(0.06 * WIDTH)}px Arial`
  ctx.fillStyle = colors.fg

  const rawAuthor = info.author ?? "Author Unknown"

  drawText(
    ctx,
    rawAuthor,
    AUTHOR_LINE_HEIGHT,
    AUTHOR_CHARS_PER_LINE,
    ctx.canvas.height * 0.85,
    AUTHOR_MAX_LINES,
  )
}

function getBlob(canvas: HTMLCanvasElement) {
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/png"),
  ) as Promise<Blob | null>
}

export async function prepareCover(
  file: File | null,
  info: Info,
  width: number = 320,
) {
  const canvas = document.createElement("canvas") as HTMLCanvasElement
  canvas.width = width
  canvas.height = Math.round((width / 2) * 3)

  const ctx = canvas.getContext("2d")

  if (ctx === null) {
    throw new Error("Cannot initialize canvas 2d")
  }

  if (file) {
    const fileUrl = URL.createObjectURL(file)
    const img = await loadImage(fileUrl)

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  } else {
    drawCover(ctx, info)
  }

  return getBlob(canvas)
}
