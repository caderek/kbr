import fs from "node:fs"
import path from "node:path"

function getAllFiles(location, extensions) {
  const entities = fs.readdirSync(location, { withFileTypes: true })

  const files = entities
    .filter((entity) => entity.isFile())
    .map((entity) => path.join(location, entity.name))
    .filter((file) => extensions.includes(path.parse(file).ext))

  const dirs = entities
    .filter((entity) => entity.isDirectory())
    .map((entity) => entity.name)

  return [
    ...files,
    ...dirs
      .map((dir) => getAllFiles(path.join(location, dir), extensions))
      .flat(),
  ]
}

const dir = "public/books"

const files = getAllFiles(dir, [".epub"]).map((p) => p.replace(/^public\//, ""))

console.log(files)
fs.writeFileSync("public/books/epub-paths.json", JSON.stringify(files, null, 2))
