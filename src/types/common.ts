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

export type DynamicBookInfo = {}

export type State = {
  lang: "en" | "pl"
  darkmode: boolean
  charset: Set<string>
  targetWPM: number
  progress: {
    currentLetter: null | number
    unlockedChars: number
    currentWPM: number
    currentLettersWPMs: number[]
  }
  stats: {
    historicalWPM: number[]
    historicalWPMs: number[][]
  }
  prompt: {
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
  options: {
    caret: "line" | "block" | "floor"
    font: string
    fontSize: number
    backspaceWholeWord: boolean
    replaceUnknownChars: boolean
    showTypos: boolean
  }
}
