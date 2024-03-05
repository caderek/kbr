import { render } from "solid-js/web"
import { Router, Route } from "@solidjs/router"
import state from "./state/state.ts"

import books from "./books.ts"
import "./boot/registerKeybindings.ts"
import App from "./components/App"
import Prompt from "./components/pages/prompt/Prompt"
import "./index.css"
import { loadWordList } from "./io/loaders.ts"
import { Epub } from "./libs/ebook/epub.ts"
import "./libs/fs.ts"
// console.clear()

async function loadEpub() {
  const res = await fetch(books[0])

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

const root = document.getElementById("root")

async function main() {
  const book = await loadEpub()
  const listData = await loadWordList("monkey-english-1k")

  if (listData instanceof Error) {
    return
  }

  const chapterNum = 1
  const paragraphs = book.chapters[chapterNum].paragraphs.slice(0, 5)
  // const paragraphs = ["the"]
  // const paragraphs = ["the hello", "the little", "the again"]
  // const paragraphs = ["out there again have so school get the must very"]
  //
  // const paragraphs = [
  //   'Please retype this text to set your initial "words per minute" speed. Press Enter to finish each paragraph.',
  //   "The timer starts when you type the first letter, and it will automatically pause, if it detects that you are inactive for five seconds.",
  //   "You can restart the current paragraph by pressing Tab, but it's usually better to fix your mistakes and continue typing. Words that contain unfixed typos are not counted towards your final score.",
  //   "If you encounter some special characters, you can press any letter (or space) to mark them as typed. For example, try it with a word naïve or 你好.",
  //   "You are now ready to begin your typing adventure!",
  // ]

  state.set("charset", book.charset)
  state.set(
    "prompt",
    "paragraphs",
    paragraphs.map((x) => x + "⏎"),
  )

  state.set("prompt", "bookId", "the-study-in-scarlet")
  state.set("prompt", "bookTitle", book.info.title)
  state.set("prompt", "chapterTitle", book.chapters[chapterNum].title.repeat(2))
  // state.set("prompt", "chapterTitle", "Introduction - Initial Speed Test")
  state.set("prompt", "page", 1000)
  state.set("prompt", "pages", 1234)

  console.log("PAGES:")

  console.log("Pages:", book.chapters[chapterNum].paragraphs.join(" ").length / (5 * 300))
  console.log("Words on this page:", paragraphs.join(" ").length / 5)
}

main()

render(
  () => (
    <Router root={App}>
      <Route path="/" component={() => <h2>Home</h2>} />
      <Route path="/books" component={() => <h2>Books</h2>} />
      <Route path="/books/:id" component={() => <h2>Book details</h2>} />
      <Route path="/stats" component={() => <h2>Stats</h2>} />
      <Route path="/settings" component={() => <h2>Settings</h2>} />
      <Route path="/profile" component={() => <h2>Profle</h2>} />
      <Route path="/prompt" component={Prompt} />
      <Route path="*404" component={() => <h1>Not Found</h1>} />
    </Router>
  ),
  root!,
)
