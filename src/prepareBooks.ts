import { Epub } from "./libs/ebook/epub.ts"
import { cleanText } from "./libs/cleanText.ts"
import { getCharset } from "./libs/charsets.ts"
const charset = getCharset("en")
const clean = cleanText(charset)

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
      const book = new Epub(data)
      const content = await book.load()

      const dirName = [content.info.author ?? "Unknown", content.info.title ?? "No Title"]
        .map((text) =>
          clean(text, { ignoreUnknownChars: true, replaceLetters: true })
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z-]/g, ""),
        )
        .join("--")

      console.log(dirName)

      const serialized = {
        dirName,
        ...content,
        charset: [...content.charset],
        info: {
          ...content.info,
          genres: [...content.info.genres],
          source:
            content.info.source instanceof URL
              ? { isUrl: true, value: content.info.source.toString() }
              : { isUrl: false, value: content.info.source },
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

      if (content.cover.medium) {
        const res = await fetch(`http://localhost:1234/cover/medium/${dirName}`, {
          method: "POST",
          body: content.cover.medium,
        })

        if (res.ok) {
          console.log("Done original cover:", bookPath)
        }
      }

      if (content.cover.small) {
        const res = await fetch(`http://localhost:1234/cover/small/${dirName}`, {
          method: "POST",
          body: content.cover.small,
        })

        if (res.ok) {
          console.log("Done standard cover:", bookPath)
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
