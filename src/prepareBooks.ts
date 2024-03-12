import { Epub } from "./libs/ebook/epub.ts"
import { serializeBook } from "./libs/ebook/serialize.ts"

async function getRawEpubPaths() {
  const res = await fetch("/raw-books/book-paths.json")
  return res.json()
}

async function prepareBooks() {
  const bookPaths = (await getRawEpubPaths()).slice(0, 10)

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

      {
        const res = await fetch("http://localhost:1234", {
          method: "POST",
          body: JSON.stringify({ info, chapters }),
        })

        if (res.ok) {
          console.log("Done info:", info.id)
        }
      }

      if (content.cover.medium) {
        const res = await fetch(
          `http://localhost:1234/cover/medium/${info.id}`,
          {
            method: "POST",
            body: cover.medium,
          },
        )

        if (res.ok) {
          console.log("Done medium cover:", info.id)
        }
      }

      if (content.cover.small) {
        const res = await fetch(
          `http://localhost:1234/cover/small/${info.id}`,
          {
            method: "POST",
            body: content.cover.small,
          },
        )

        if (res.ok) {
          console.log("Done small cover:", info.id)
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
