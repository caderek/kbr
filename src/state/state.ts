import { createEffect, createRoot } from "solid-js"
import { SetStoreFunction, createStore } from "solid-js/store"
import storage from "../storage/storage.ts"
import type {
  State,
  Settings,
  BooksIndex,
  BooksLiveIndex,
} from "../types/common"
import {
  getBooksIndexLastUpdate,
  getBooksIndex,
} from "../libs/api-helpers/apiCalls.ts"

const defaultSettings: Settings = {
  uiLang: "en",
  darkmode: true,
  promptFont: "PT Mono",
  promptFontSize: 20,
  caret: "line",
  targetWpm: 60,
  targetAcc: 0.95,
  showTypos: true,
  backspaceWholeWord: false,
  replaceUnknownChars: false,
  booksPerPage: 60,
  sortBy: "author",
  paginateChapters: false,
}

const defaultState: State = {
  loaded: false,
  stats: {
    historicalWPM: [],
    historicalWPMs: [],
  },
  prompt: {
    lang: null,
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
  settings: defaultSettings,
  booksIndex: [],
  session: {
    booksPage: 1,
    search: "",
  },
}

async function loadSavedData(state: State, setState: SetStoreFunction<State>) {
  const settings = await storage.general.get("settings")

  if (settings) {
    setState("settings", settings)
  }

  const lastBooksIndexUpdate = await getBooksIndexLastUpdate()
  const savedBooksIndex = await storage.general.get("booksIndex")

  let booksIndex: null | BooksIndex = null

  if (!savedBooksIndex || lastBooksIndexUpdate > savedBooksIndex.lastUpdate) {
    const newBooksIndex = await getBooksIndex()

    if (newBooksIndex) {
      booksIndex = newBooksIndex
    }
  } else {
    booksIndex = savedBooksIndex
  }

  if (booksIndex) {
    // Fetch QuickBookStats from storage
    const booksWithStats = new Set(await storage.booksStats.keys())

    const booksLiveIndex: BooksLiveIndex = []

    for (const book of booksIndex.books) {
      let progress = 0
      let favorite = false

      if (booksWithStats.has(book.id)) {
        progress = (await storage.booksStats.get(book.id))?.progress ?? 0
      }

      booksLiveIndex.push({
        ...book,
        progress,
        favorite,
      })
    }

    setState("booksIndex", booksLiveIndex)
    await storage.general.set("booksIndex", booksIndex)
  }

  setState("loaded", true)
  console.log("--- STATE ------------------")
  console.log(state)
}

const state = createRoot(() => {
  // TODO merge default and saved state or full migration
  // const [state, setState] = createStore(savedState ?? defaultState)
  const [state, setState] = createStore(defaultState)

  loadSavedData(state, setState)

  createEffect(() => {
    if (state.loaded) {
      storage.general.set("settings", { ...state.settings })
    }
  })

  createEffect(() => {
    if (state.settings.darkmode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  })

  return { get: state, set: setState }
})

// setTimeout(() => {
//   state.set("settings", "booksPerPage", 12 * 5)
// }, 1000)

export default state
