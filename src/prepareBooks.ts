import { Epub } from "./libs/ebook/epub.ts"
import "./libs/fs.ts"

async function getRawEpubPaths() {
  const res = await fetch("raw-books/book-paths.json")
  return res.json()
}

async function prepareBooks() {
  const bookPaths = (await getRawEpubPaths()).slice(0)

  for (const bookPath of bookPaths) {
    try {
      console.log(bookPath)
      const res = await fetch(bookPath)

      if (!res.ok) {
        console.error("Cannot fetch")
        console.error(bookPath)
        continue
      }

      const data = await res.blob()
      console.log(data)
      const book = new Epub(data)
      const content = await book.load()
      const serialized = {
        ...content,
        charset: [...content.charset],
        info: {
          ...content.info,
          genres: [...content.info.genres],
        },
      }

      {
        const res = await fetch("http://localhost:1234", {
          method: "POST",
          body: JSON.stringify(serialized),
        })

        if (res.ok) {
          console.log("Done:", bookPath)
        }
      }
    } catch (e) {
      console.error(e)
      console.error("Path:", bookPath)
    }
  }
}

export default prepareBooks
