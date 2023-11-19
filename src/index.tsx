/* @refresh reload */
import { render } from "solid-js/web"
import { setState } from "./state/state.ts"

import "./index.css"
import App from "./components/App"
import { WordList } from "./models/WordList.ts"
import { loadWordList } from "./io/loaders.ts"
import "./boot/registerKeybindings.ts"
import { getNgrams } from "./utils/ngrams.ts"

const root = document.getElementById("root")

async function main() {
  const listData = await loadWordList("en", 200)

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

  setState("prompt", "text", lesson)

  const ngrams = getNgrams(list.words, 3)

  console.log({ ngrams: ngrams.size })

  // console.log([...ngrams].sort().join("\n"))
  //
  // console.log(ngrams)
}

main()

render(() => <App />, root!)
