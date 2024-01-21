/* @refresh reload */
import { render } from "solid-js/web"
import { setState } from "./state/state.ts"

import "./index.css"
import App from "./components/App"
import { WordList } from "./models/WordList.ts"
import { loadBookTxt, loadWordList } from "./io/loaders.ts"
import "./boot/registerKeybindings.ts"
import { getNgrams } from "./utils/ngrams.ts"

const root = document.getElementById("root")

async function main() {
  const listData = await loadWordList("monkey-english-1k")
  const bookData = await loadBookTxt("a_study_in_scarlet")

  console.log(bookData)

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
with desperate slowness up the slope to the top of the quarry, where ahey were toppled over the edge, to shatter to pieces below. 
Transporting the stone when it was once broken was comparatively 
simple. The horses carried it off in cart-loads, the sheep dragged 
single blocks, even Muriel and Benjamin yoked themselves into an old 
governess-cart and did their share. By late summer a sufficient store 
of stone had accumulated, and then the building began, under the 
superintendence of the pigs.`,
  )

  const ngrams = getNgrams(list.words, 3)

  console.log({ ngrams: ngrams.size })

  // console.log([...ngrams].sort().join("\n"))
  //
  // console.log(ngrams)
}

main()

render(() => <App />, root!)
