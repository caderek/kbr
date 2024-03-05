import { Storage } from "../io/persistance"
import { createEffect, createRoot } from "solid-js"
import { createStore } from "solid-js/store"
import type { State } from "../types/common"

const storage = new Storage()

// const savedState = storage.load()

const defaultState: State = {
  lang: "en",
  darkmode: true,
  charset: new Set(),
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
    bookTitle: null,
    bookId: null,
    chapterTitle: null,
    page: 1,
    pages: 1,
    currentParagraph: 0,
    paragraphs: [],
    done: false,
    wpm: 0,
  },
  options: {
    caret: "line",
    font: "PT Mono",
    fontSize: 20,
    backspaceWholeWord: false,
    replaceUnknownChars: false,
    showTypos: true,
  },
}

const state = createRoot(() => {
  // TODO merge default and saved state or full migration
  // const [state, setState] = createStore(savedState ?? defaultState)
  const [state, setState] = createStore(defaultState)

  createEffect(() => {
    storage.save(state)
  })

  createEffect(() => {
    if (state.darkmode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  })

  return { get: state, set: setState }
})

export default state
