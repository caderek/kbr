import { Storage } from "../io/persistance"
import { createEffect } from "solid-js"
import { createStore } from "solid-js/store"
import type { State } from "../types/common"

const storage = new Storage()

const savedState = storage.load()

const defaultState: State = {
  lang: "en",
  targetWPM: 35,
  progress: {
    currentLetter: null,
    unlockedChars: 8,
    currentWPM: 0,
    currentLettersWPMs: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  stats: {
    historicalWPM: [],
    historicalWPMs: [],
  },
  prompt: {
    text: "",
    done: false,
    wpm: 0,
  },
}

const [state, setState] = createStore(savedState ?? defaultState)

createEffect(() => {
  storage.save(state)
})

export { state, setState }
