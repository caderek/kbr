/* @refresh reload */
import { render } from "solid-js/web"
import { setState } from "./state/state.ts"

import "./index.css"
import App from "./components/App"
import { WordList } from "./models/WordList.ts"
import { loadWordList } from "./io/loaders.ts"
import "./boot/registerKeybindings.ts"
import { getNgrams } from "./utils/ngrams.ts"
import { Epub } from "./libs/ebook/epub.ts"

async function loadEpub() {
  // const res = await fetch("books/quo_vadis.epub")
  // const res = await fetch("books/monte_cristo.epub")
  // const res = await fetch("books/ogniem_i_mieczem.epub")
  // const res = await fetch("books/anne_new.epub")
  // const res = await fetch("books/anne_old.epub")
  // const res = await fetch("books/anne_old_no_images.epub")
  // const res = await fetch("books/harry_potter_2.epub")
  // const res = await fetch("books/cell.epub")
  // const res = await fetch("books/dotknij_mnie.epub")
  // const res = await fetch("books/start_a_fire_1.epub")
  // const res = await fetch("books/a_study_in_scarlet.epub")
  // const res = await fetch("books/dracula.epub")
  // const res = await fetch("books/the_princess_bride.epub")
  // const res = await fetch("books/got.epub")
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
  const res = await fetch("books/rifters_3_behemoth.epub")
  // const res = await fetch(
  //   "books/the_hundred-year-old_man_who_climbed_out_the_window_and_disappeared.epub",
  // )
  const data = await res.blob()
  const book = new Epub(data)
  const content = await book.load()

  console.log("--- BOOK ---------------")
  console.log(content)

  const wpm = 50

  for (const chapter of content.chapters.slice(0, 5)) {
    const chars = chapter.paragraphs.join(" ").length
    const words = Math.floor(chars / 5)
    const time = Math.round(words / wpm)
    console.log(
      `%c${chars} characters, ${words} words, estimated time: ${time} min`,
      "color: cyan",
    )
    console.log(`%c${chapter.title}`, "color: lime")
    console.log(chapter.paragraphs.join("\n\n"))
  }
}

loadEpub()

const root = document.getElementById("root")

async function main() {
  const listData = await loadWordList("monkey-english-1k")

  if (listData instanceof Error) {
    return
  }

  const list = new WordList(listData)

  const lettersUnlocked = 8
  const practiceSize = 40 //Infinity
  const letters = list.lettersByFrequency.slice(0, lettersUnlocked)
  const must = "" //letters.slice(-1)

  console.log(list.lettersByFrequency)

  const lesson = list.getLesson({
    letters: letters,
    mustIncludeLetters: must,
    wordlistMaxSize: practiceSize,
    lettersCount: 100,
  })

  setState(
    "prompt",
    "text",
    `The pigs sometimes joined in at critical moments--they dragged them 
with desperate slowness up the slope to the top of the quarry, where ahey were toppled over the edge, to shatter to pieces below.`
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " "),
  )

  const ngrams = getNgrams(list.words, 3)

  console.log({ ngrams: ngrams.size })

  // console.log([...ngrams].sort().join("\n"))
  //
  // console.log(ngrams)
}

main()

render(() => <App />, root!)
