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
  titleAlpha: string | null
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
  createdAt: number
}

export type StaticChapterContent = {
  id: string
  text: string
}

export type QuickBookInfo = {
  id: string
  title: string
  titleAlpha: string
  author: string
  description: string | null
  genres: string[]
  length: number
  year: number
  createdAt: number
}

export type BooksIndex = {
  lastUpdate: number
  books: QuickBookInfo[]
}

export type FinishedParagraphStats = {
  accuracy: number
  wpm: number
  consistency: number
  time: number
}

export type ChapterStats = {
  progress: number
  accuracy: number
  wpm: number
  consistency: number
  paragraphs: FinishedParagraphStats[]
}

export type BookStats = {
  progress: number
  accuracy: number
  wpm: number
  consistency: number
  chapters: ChapterStats[]
}

export type SortBy = "author" | "title" | "length" | "year" | "added"

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
  sortBy: SortBy
  paginateChapters: boolean
}

export type Session = {
  booksPage: number
  search: string
}

export type BookPrompt = {
  type: "book"
  data: {}
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
