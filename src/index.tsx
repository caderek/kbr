/* @refresh reload */
import { render } from "solid-js/web"
import { setState } from "./state/state.ts"

import "./index.css"
import App from "./components/App"
import { WordList } from "./models/WordList.ts"
import { loadBookTxt, loadWordList } from "./io/loaders.ts"
import "./boot/registerKeybindings.ts"
import { getNgrams } from "./utils/ngrams.ts"
import { Epub } from "./libs/ebook/epub.ts"

async function loadEpub() {
  // const res = await fetch("books/a_study_in_scarlet.epub")
  // const res = await fetch("books/dracula.epub")
  // const res = await fetch("books/the_princess_bride.epub")
  const res = await fetch("books/got.epub")
  // const res = await fetch("books/the_girl_who_saved_the_king_of_sweden.epub")
  // const res = await fetch(
  //   "books/the_hundred-year-old_man_who_climbed_out_the_window_and_disappeared.epub",
  // )
  const data = await res.blob()
  console.log(data)

  const book = new Epub(data)
  await book.load()
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
