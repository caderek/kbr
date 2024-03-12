import fs from "node:fs"
import path from "node:path"

const SOURCE_DIR = path.join("public", "books")

const bookFolders = fs
  .readdirSync(SOURCE_DIR)
  .filter((name) => name !== "index.json")

const indexData = []

for (const dir of bookFolders) {
  const info = JSON.parse(
    fs.readFileSync(path.join(SOURCE_DIR, dir, "info.json"), "utf8"),
  )

  indexData.push({
    id: info.id,
    title: info.title,
    author: info.author,
    description: info.description,
    genres: info.genres,
    length: info.chapters
      .filter((chapter) => chapter.skip === "no")
      .map((chapter) => chapter.length)
      .reduce((sum, len) => sum + len, 0),
  })
}

fs.writeFileSync(path.join(SOURCE_DIR, "index.json"), JSON.stringify(indexData))
