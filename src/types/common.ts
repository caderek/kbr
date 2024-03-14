export type WordListData = {
  name: string
  words: string[]
}

export type StaticChapterInfo = {
  id: string
  title: string
  length: number
  skip: "no" | "yes" | "always"
}

export type StaticBookInfo = {
  id: string
  title: string | null
  author: string | null
  language: string | null
  description: string | null
  longDescription: string[]
  year: number | null
  genres: string[]
  rights: string | null
  publisher: string | null
  source: {
    isUrl: boolean
    value: string
  } | null
  chapters: StaticChapterInfo[]
}

export type StaticChapterContent = {
  id: string
  text: string
}

export type QuickBookInfo = {
  id: string
  title: string
  author: string
  description: string | null
  genres: string[]
  length: number
}

export type BooksIndex = {
  lastUpdate: number
  books: QuickBookInfo[]
}

export type DynamicBookInfo = {}

export type Settings = {
  uiLang: "en" | "pl"
  darkmode: boolean
  promptFont: string
  promptFontSize: number
  caret: "line" | "block" | "floor"
  targetWpm: number
  targetAcc: number
  showTypos: boolean
  backspaceWholeWord: boolean
  replaceUnknownChars: boolean
  booksPerPage: number
}

export type Session = {
  booksPage: number
}

export type State = {
  loaded: boolean
  stats: {}
  prompt: {
    lang: string | null
    bookTitle: string | null
    bookId: string | null
    chapterTitle: string | null
    page: number
    pages: number
    currentParagraph: number
    paragraphs: string[]
    done: boolean
    wpm: number
  }
  settings: Settings
  booksIndex: BooksIndex
  session: Session
}

export type BookStats = {}
