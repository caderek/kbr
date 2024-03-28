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

export type QuickBookStats = {
  progress: number
  favorite: boolean
}

export type QuickBookData = QuickBookInfo & QuickBookStats

export type BooksIndex = {
  lastUpdate: number
  books: QuickBookInfo[]
}

export type BooksLiveIndex = QuickBookData[]

export type BasicStats = {
  wpm: {
    value: number
    raw: number
    weight: number
  }
  acc: {
    value: number
    weight: number
  }
  consistency: {
    value: number
    weight: number
  }
  time: number
  timestamp: number
  length: number
}

export type ProgressStats = {
  progress: number
}

export type FinishedParagraphStats = BasicStats
export type ChapterStats = BasicStats & ProgressStats
export type BookStats = BasicStats & ProgressStats & { lastChapter: number }

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
  booksIndex: BooksLiveIndex
  session: Session
}
