import path from "node:path"
import fs from "node:fs/promises"
import sharp from "sharp"

const DIR = path.join("public", "books")

function optimizeImage(inputPath, outputPath) {
  return sharp(inputPath)
    .png({
      quality: 80,
      compressionLevel: 9,
    })
    .toFile(outputPath)
}

const dirs = (await fs.readdir(DIR)).filter((entry) => entry !== "index.json")

for (const dir of dirs) {
  console.log("Optimizing:", dir)

  const images = (await fs.readdir(path.join(DIR, dir))).filter(
    (entry) => entry.endsWith(".png") && !entry.endsWith(".min.png"),
  )

  for (const image of images) {
    const inputPath = path.join(DIR, dir, image)
    const outputPath = path.join(DIR, dir, image.replace(/\.png$/, ".min.png"))
    await optimizeImage(inputPath, outputPath)
  }
}
