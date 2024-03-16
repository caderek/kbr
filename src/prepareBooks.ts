import { Epub } from "./libs/ebook/epub.ts"
import { serializeBook } from "./libs/ebook/serialize.ts"

async function getRawEpubPaths() {
  const res = await fetch("/raw-books/book-paths.json")
  return res.json()
}

async function prepareBooks(limit: number = Infinity) {
  const bookPaths = (await getRawEpubPaths()).slice(0, limit)

  for (const bookPath of bookPaths) {
    try {
      console.log(bookPath)
      const res = await fetch("/" + bookPath)

      if (!res.ok) {
        console.error("Cannot fetch")
        console.error(bookPath)
        continue
      }

      const data = await res.blob()
      const book = new Epub(data)
      const content = await book.load()

      const { cover, chapters, info } = serializeBook(content)

      if (info.genres.includes("poetry") || info.genres.includes("drama")) {
        console.warn("Skipping drama and poetry")
        continue
      }

      {
        const res = await fetch("http://localhost:1234", {
          method: "POST",
          body: JSON.stringify({ info, chapters }),
        })

        if (res.ok) {
          console.log("Done info:", info.id)
        }
      }

      if (cover) {
        const headers = new Headers()
        headers.append("Content-Type", "image/png")
        headers.append("Content-Length", cover.size.toString())

        const res = await fetch(`http://localhost:1234/cover/${info.id}`, {
          method: "POST",
          body: cover,
          headers,
        })

        if (res.ok) {
          console.log("Done cover:", info.id)
        }
      }
    } catch (e) {
      console.error(e)
      console.error("Path:", bookPath)
    }
    console.log("---------------------------------------------")
  }

  console.log("Done!")
}

export default prepareBooks
