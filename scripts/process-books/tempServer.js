import http from "node:http"
import path from "node:path"
import fs from "node:fs/promises"

const PORT = 1234
const OUT_DIR = path.join("public", "books")

function readBlob(req) {
  const chunks = []

  req.on("data", (chunk) => {
    chunks.push(chunk)
  })

  return new Promise((resolve) => {
    req.on("end", () => {
      const body = Buffer.concat(chunks)
      resolve(body)
    })
  })
}

async function readJSON(req) {
  const buff = await readBlob(req)
  return JSON.parse(buff.toString("utf8"))
}

async function saveBook(book) {
  const BOOK_DIR = path.join(OUT_DIR, book.info.id)

  await fs.mkdir(BOOK_DIR, { recursive: true })
  await fs.writeFile(
    path.join(BOOK_DIR, "info.json"),
    JSON.stringify(book.info),
  )

  for (const chapter of book.chapters) {
    await fs.writeFile(path.join(BOOK_DIR, `${chapter.id}.txt`), chapter.text)
  }
}

async function saveCover(req) {
  const [_, type, dirName] = req.url.slice(1).split("/")
  const data = await readBlob(req)

  const BOOK_DIR = path.join(OUT_DIR, dirName)
  const coverPath = path.join(BOOK_DIR, `cover-${type}.png`)

  await fs.mkdir(BOOK_DIR, { recursive: true })
  await fs.writeFile(coverPath, data)
}

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST")
    res.setHeader("Access-Control-Allow-Headers", "content-type")
    console.log(req.method, req.url)

    if (req.url === "/") {
      const body = await readJSON(req)
      await saveBook(body)
      console.log(body.info.author, "-", body.info.title)
      res.end()
    } else if (req.url.startsWith("/cover")) {
      await saveCover(req)
      res.end()
    }
  })
  .listen(PORT)
