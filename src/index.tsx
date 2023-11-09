/* @refresh reload */
import { render } from "solid-js/web"
import { setState } from "./state/state.ts"

import "./index.css"
import App from "./components/App"
import { WordList } from "./models/WordList.ts"
import { loadWordList } from "./io/loaders.ts"

import "./boot/registerShortcuts.ts"

const root = document.getElementById("root")

async function main() {
  const listData = await loadWordList("en", 1000)

  if (listData instanceof Error) {
    return
  }

  const list = new WordList(listData)

  const lettersUnlocked = 8
  const practiceSize = 40 //Infinity
  const letters = list.lettersByFrequency.slice(0, lettersUnlocked)
  const must = "" //letters.slice(-1)

  const lesson = list.getLesson({
    letters,
    mustIncludeLetters: must,
    wordlistMaxSize: practiceSize,
    lettersCount: 100,
  })

  console.log({ lesson: lesson.length })

  console.log({ freq: list.lettersByFrequency.slice(0, lettersUnlocked) })

  setState("prompt", "text", lesson)

  console.log(list.ngrams)
}

main()

render(() => <App />, root!)
