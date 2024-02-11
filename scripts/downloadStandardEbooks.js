import fs from "node:fs"
import { JSDOM } from "jsdom"

const OUT_DIR = "public/books/epub_public_domain_se"

const existing = new Set(fs.readdirSync(OUT_DIR))

console.log(existing)

const domain = "https://standardebooks.org"

let page = 1
let maxPage = 80

const tags = new Set()
const tagsPerBook = []

async function downloadEpub(data) {
  const res = await fetch(data.link)

  if (!res.ok) {
    console.error(link, res.status)
  }

  const content = await res.text()
  const html = new JSDOM(content)

  const downloadPath = [
    ...html.window.document.querySelectorAll("#download a.epub"),
  ].at(-1).href

  const bookTags = [...html.window.document.querySelectorAll(".tags > li")].map(
    (node) => node.textContent.toLowerCase(),
  )

  tagsPerBook.push(bookTags)
  bookTags.forEach((tag) => tags.add(tag))

  const downloadLink = `${domain}${downloadPath}`
  const fileName = downloadLink
    .split("/")
    .at(-1)
    .replace("_advanced.epub", ".epub")

  if (existing.has(fileName)) {
    console.log("Skip:", fileName)
    return
  }
  console.log(`Downloading:`, fileName)

  const epubRes = await fetch(downloadLink)
  const epubData = await epubRes.arrayBuffer()

  fs.writeFileSync(`${OUT_DIR}/${fileName}`, Buffer.from(epubData))

  console.log(`Done:`, fileName)
}

while (true) {
  if (page > maxPage) {
    break
  }
  console.log("Page:", page)

  const res = await fetch(`${domain}/ebooks?page=${page}`)

  if (!res.ok) {
    break
  }

  const content = await res.text()
  const html = new JSDOM(content)

  const entries = [...html.window.document.querySelectorAll(".ebooks-list li")]

  for (const entry of entries) {
    const title = entry.querySelector("p").textContent
    const author = entry.querySelector("p.author").textContent
    const link = `${domain}${entry.querySelector("p > a").href}`

    await downloadEpub({ title, author, link })
  }

  page++
}

console.log(tags)

fs.writeFileSync("public/books/se-tags.txt", [...tags].sort().join("\n"))
fs.writeFileSync(
  "public/books/se-tags-per-book.txt",
  JSON.stringify(tagsPerBook, null, 2),
)
