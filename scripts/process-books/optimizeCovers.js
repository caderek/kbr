import path from "node:path"
import fs from "node:fs"
import sharp from "sharp"

const DIR = path.join("public", "books")

function optimizeImage(inputPath, outputPath, width, height) {
  return sharp(inputPath)
    .resize({
      width,
      height,
      fit: "fill",
    })
    .png({
      quality: 80,
      compressionLevel: 9,
    })
    .toFile(outputPath)
}

const dirs = fs.readdirSync(DIR).filter((entry) => entry !== "_meta_")

for (const dir of dirs) {
  console.log("Optimizing:", dir)

  const correctedCoverPath = path.join(
    "public",
    "corrections",
    "covers",
    `${dir}.png`,
  )
  const inputPath = fs.existsSync(correctedCoverPath)
    ? correctedCoverPath
    : path.join(DIR, dir, "cover.png")

  await optimizeImage(inputPath, path.join(DIR, dir, `cover.min.png`), 320, 480)
  await optimizeImage(
    inputPath,
    path.join(DIR, dir, `cover-small.min.png`),
    160,
    240,
  )

  fs.rmSync(inputPath)
}
