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

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    const body = await readJSON(req)
    await fs.writeFile(path.join(OUT_DIR, `${body.info.author} - ${body.info.title}.json`), JSON.stringify(body))
    console.log(body.info.author, "-", body.info.title)
    res.end("Hello")
  })
  .listen(PORT)
