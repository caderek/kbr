/* @refresh reload */
import { render } from "solid-js/web"
import { setState } from "./state/state.ts"

import "./index.css"
import App from "./components/App"
import { loadWordList } from "./io/loaders.ts"
import "./boot/registerKeybindings.ts"
import { Epub } from "./libs/ebook/epub.ts"
console.clear()

async function loadEpub() {
  // const res = await fetch("books/quo_vadis.epub")
  // const res = await fetch(
  //   "books/alexandre-dumas_the-count-of-monte-cristo.epub",
  // )
  const res = await fetch("books/ogniem_i_mieczem.epub")
  // const res = await fetch("books/anne_old.epub")
  // const res = await fetch("books/anne_old_no_images.epub")
  // const res = await fetch("books/anne_1.epub")
  // const res = await fetch("books/anne_2.epub")
  // const res = await fetch("books/anne_3.epub")
  // const res = await fetch("books/anne_4.epub")
  // const res = await fetch("books/harry_potter_2.epub")
  // const res = await fetch("books/cell.epub")
  // const res = await fetch("books/dotknij_mnie.epub")
  // const res = await fetch("books/start_a_fire_1.epub")
  // const res = await fetch("books/a_study_in_scarlet.epub")
  // const res = await fetch("books/dracula.epub")
  // const res = await fetch("books/the_princess_bride.epub")
  // const res = await fetch("books/got.epub")
  // const res = await fetch("books/bram-stoker_dracula_advanced.epub")
  // const res = await fetch("books/the_girl_who_saved_the_king_of_sweden.epub")
  // const res = await fetch("books/madness.epub")
  // const res = await fetch("books/The-Island-of-Doctor-Moreau.epub")
  // const res = await fetch("books/guards_guards.epub")
  // const res = await fetch("books/blindsight.epub")
  // const res = await fetch("books/little_brother.epub")
  // const res = await fetch("books/ember.epub")
  // const res = await fetch("books/typhoon.epub")
  // const res = await fetch("books/the_vector.epub")
  // const res = await fetch("books/rifters_1_starfish.epub")
  // const res = await fetch("books/rifters_2_maelstrom.epub")
  // const res = await fetch("books/rifters_3_behemoth.epub")
  // const res = await fetch("books/the_hundred-year-old_man.epub")

  if (!res.ok) {
    throw new Error("File cannot be fetched")
  }

  const data = await res.blob()
  const book = new Epub(data)
  const content = await book.load()

  console.log("--- BOOK ---------------")
  console.log(content)

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

  for (const [index, chapter] of content.chapters.entries()) {
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
    `%c${formatNum(content.chapters.length)} chapters, ${formatNum(
      totalChars,
    )} characters, ${formatNum(
      totalWords,
    )} words, estimated time: ${formatMinutes(totalTime)}`,
    "color: orange",
  )

  for (const [key, val] of Object.entries(content.info)) {
    console.log(`%c${key}:`, "color: hotpink", val)
  }

  let bookTxt = content.chapters
    .map((chapter) => [chapter.title, ...chapter.paragraphs].join("\n\n"))
    .join("\n\n\n")

  const file = new File([bookTxt], "book.txt")

  const url = URL.createObjectURL(file)
  const dw = document.createElement("a") as HTMLAnchorElement
  dw.href = url
  dw.download = "book.txt"
  // dw.click()
}

loadEpub()

const root = document.getElementById("root")

async function main() {
  const listData = await loadWordList("monkey-english-1k")

  if (listData instanceof Error) {
    return
  }

  setState(
    "prompt",
    "text",
    `The quick brown fox jumps over the lazy dog.`
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " "),
  )
}

main()

render(() => <App />, root!)
