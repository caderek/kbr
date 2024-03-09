import { Epub } from "./libs/ebook/epub.ts"

export async function loadEpub() {
  const books = await fetch("raw-books/book-paths.json").then((res) => res.json())

  const res = await fetch(books[Math.floor(Math.random() * books.length)])

  if (!res.ok) {
    throw new Error("File cannot be fetched")
  }

  const data = await res.blob()
  const book = new Epub(data)
  const content = await book.load()

  console.log("--- BOOK ---------------")
  console.log(content)

  if (content.info.longDescription) {
    console.log(content.info.longDescription.join("\n\n"))
  }

  function formatMinutes(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60

    let pretty = []

    if (h > 0) {
      pretty.push(`${h}h`)
    }

    if (m > 0) {
      pretty.push(`${m}m`)
    } else if (h === 0) {
      pretty.push(`<1m`)
    }

    return pretty.join(" ")
  }

  function formatNum(num: number) {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const wpm = 50
  let totalTime = 0
  let totalChars = 0
  let totalWords = 0

  for (const [_, chapter] of content.chapters.entries()) {
    const chars = chapter.paragraphs.join(" ").length
    const words = Math.floor(chars / 5)
    const time = Math.round(words / wpm)
    totalChars += chars
    totalWords += words
    totalTime += time

    // console.log(`%c${chapter.title}`, "color: lime")
    //
    // console.log(
    //   `%c${formatNum(chars)} characters, ${formatNum(
    //     words,
    //   )} words, estimated time: ${formatMinutes(time)}`,
    //   "color: cyan",
    // )
    //
    // if (index < 5 || index === content.chapters.length - 1) {
    //   console.log(chapter.paragraphs.join("\n\n"))
    // }
  }

  console.log(
    `%c${formatNum(content.chapters.length)} chapters, ${formatNum(totalChars)} characters, ${formatNum(
      totalWords,
    )} words, estimated time: ${formatMinutes(totalTime)}`,
    "color: orange",
  )

  for (const [key, val] of Object.entries(content.info)) {
    console.log(`%c${key}:`, "color: hotpink", val)
  }

  let bookTxt = content.chapters.map((chapter) => [chapter.title, ...chapter.paragraphs].join("\n\n")).join("\n\n\n")

  const file = new File([bookTxt], "book.txt")

  const url = URL.createObjectURL(file)
  const dw = document.createElement("a") as HTMLAnchorElement
  dw.href = url
  dw.download = "book.txt"
  // dw.click()
  //
  return content
}
