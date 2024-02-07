import type { Info } from "./types"

const TITLE_LINE_HEIGHT = 50
const TITLE_CHARS_PER_LINE = 10
const TITLE_MAX_LINES = 5
const AUTHOR_LINE_HEIGHT = 30
const AUTHOR_CHARS_PER_LINE = 20
const AUTHOR_MAX_LINES = 3

const keywords = {
  horror: ["horror", "terror", "monster"],
}

function hasKeywords(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function getCoverColors(text: string) {
  if (hasKeywords(text, keywords.horror)) {
    return { bg: "#0d0a10", fg: "#a80d20", fg2: "#a80d20aa" }
  }

  if (hasKeywords(text, ["historic"])) {
    return { bg: "#1a0f10", fg: "#c27427", fg2: "#c27427aa" }
  }

  return { bg: "#0f111a", fg: "#5973de", fg2: "#5973deaa" }
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
  const infoText = `${info.title ?? ""} ${info.subject ?? ""} ${
    info.description ?? ""
  }`
  const colors = getCoverColors(infoText)
  console.log(infoText)

  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.strokeStyle = colors.fg
  ctx.strokeRect(20, 20, ctx.canvas.width - 40, ctx.canvas.height - 40)
  ctx.strokeStyle = colors.fg2
  ctx.strokeRect(25, 25, ctx.canvas.width - 50, ctx.canvas.height - 50)

  ctx.textAlign = "center"

  ctx.font = "bold 48px serif"
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

  ctx.font = "bold 24px sans-serif"
  ctx.fillStyle = colors.fg2

  const rawAuthor = info.creator ?? info.author ?? "Authot Unknown"

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

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )
  } else {
    drawCover(ctx, info)
  }

  return loadImage(canvas.toDataURL())
}
