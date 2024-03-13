import fs from "node:fs"
import path from "node:path"

const SOURCE_DIR = path.join("public", "books")

const bookFolders = fs
  .readdirSync(SOURCE_DIR)
  .filter((name) => name !== "index.json")

const indexData = {
  lastUpdate: Date.now(),
  books: [],
}

for (const dir of bookFolders) {
  const info = JSON.parse(
    fs.readFileSync(path.join(SOURCE_DIR, dir, "info.json"), "utf8"),
  )

  indexData.books.push({
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

const metaDir = path.join(SOURCE_DIR, "_meta_")

fs.mkdirSync(metaDir, { recursive: true })

fs.writeFileSync(path.join(metaDir, "index.json"), JSON.stringify(indexData))

fs.writeFileSync(
  path.join(metaDir, "lastUpdate.json"),
  JSON.stringify(indexData.lastUpdate),
)
