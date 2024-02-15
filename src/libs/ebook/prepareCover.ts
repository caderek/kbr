import type { Info } from "./types"

const TITLE_LINE_HEIGHT = 50
const TITLE_CHARS_PER_LINE = 10
const TITLE_MAX_LINES = 5
const AUTHOR_LINE_HEIGHT = 30
const AUTHOR_CHARS_PER_LINE = 20
const AUTHOR_MAX_LINES = 3

function getCoverColors(genres: Set<string>) {
  if (genres.has("children")) {
    return { bg: "#BFDB38", fg: "#00425A", fg2: "#00425ACC" }
  }

  if (genres.has("young-adult")) {
    return { bg: "#37264D", fg: "#ACFFAD", fg2: "#ACFFADCC" }
  }

  if (genres.has("horror")) {
    return { bg: "#0D0A10", fg: "#A80D20", fg2: "#A80D20CC" }
  }

  if (genres.has("mystery") || genres.has("crime") || genres.has("thriller")) {
    return { bg: "#151722", fg: "#C4C4C4", fg2: "#C4C4C4CC" }
  }

  if (genres.has("fantasy")) {
    return { bg: "#361A4D", fg: "#FEC260", fg2: "#FEC260CC" }
  }

  if (genres.has("science-fiction")) {
    return { bg: "#0E131E", fg: "#A5FB38", fg2: "#A5FB38CC" }
  }

  if (genres.has("adventure")) {
    return { bg: "#18291F", fg: "#FFCA42", fg2: "#FFCA42CC" }
  }

  if (genres.has("romance") || genres.has("erotic")) {
    return { bg: "#261E2B", fg: "#FF2E63", fg2: "#FF2E63CC" }
  }

  if (genres.has("drama") || genres.has("poetry")) {
    return { bg: "#331D2C", fg: "#EFE1D1", fg2: "#EFE1D1CC" }
  }

  if (genres.has("comedy")) {
    return { bg: "#4E1839", fg: "#FB8B24", fg2: "#FB8B24CC" }
  }

  if (genres.has("satire")) {
    return { bg: "#272121", fg: "#FF4D00", fg2: "#FF4D00CC" }
  }

  if (genres.has("philosophy") || genres.has("spirituality")) {
    return { bg: "#1F2544", fg: "#FFD0EC", fg2: "#FFD0ECCC" }
  }

  if (
    genres.has("biography") ||
    genres.has("autobiography") ||
    genres.has("memoir")
  ) {
    return { bg: "#2D2424", fg: "#E0C097", fg2: "#E0C097CC" }
  }

  if (genres.has("history")) {
    return { bg: "#1A0F10", fg: "#DB8A3A", fg2: "#DB8A3ACC" }
  }

  if (genres.has("fiction")) {
    return { bg: "#222831", fg: "#00ADB5", fg2: "#00ADB5CC" }
  }

  if (genres.has("nonfiction")) {
    return { bg: "#222831", fg: "#FFD369", fg2: "#FFD369CC" }
  }

  return { bg: "#222831", fg: "#CBE4DE", fg2: "#CBE4DECC" }
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
  console.log({ MAX_CHARS: maxChars })

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

    ctx.fillText(chunk.toUpperCase(), ctx.canvas.width / 2, y, 310)
  }
}

function drawCover(ctx: CanvasRenderingContext2D, info: Info) {
  const colors = getCoverColors(info.genres)

  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.strokeStyle = colors.fg
  ctx.strokeRect(20, 20, ctx.canvas.width - 40, ctx.canvas.height - 40)

  ctx.textAlign = "center"

  ctx.font = "bold 48px 'Times New Roman'"
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

  ctx.font = "bold 24px Arial"
  ctx.fillStyle = colors.fg2

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

export async function prepareCover(file: File | null, info: Info) {
  const canvas = document.createElement("canvas") as HTMLCanvasElement
  canvas.width = 400
  canvas.height = 600

  const ctx = canvas.getContext("2d")

  if (ctx === null) {
    throw new Error("Cannot initialize canvas 2d")
  }

  if (file) {
    const fileUrl = URL.createObjectURL(file)
    const img = await loadImage(fileUrl)

    console.log({ w: img.width, h: img.height })
    console.dir(img)

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  } else {
    drawCover(ctx, info)
  }

  return loadImage(canvas.toDataURL())
}
