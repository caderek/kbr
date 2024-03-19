import { StaticChapterInfo } from "../../../types/common"

export type WordStats = {
  length: number
  typedLength: number
  times: number[][]
  isCorrect: boolean
  hadTypos: boolean
}

export type ParagraphStats = {
  charCount: number
  correctCharCount: number
  wordCount: number
  wpm: null | number
  acc: null | number
  consistency: null | number
  inputTimes: number[]
  totalKeystrokes: number
  startTime: number
  endTime: number
  totalTime: number
  typos: number
  nonTypos: number
  words: WordStats[]
}

export type PageStats = {
  wpm: null | number
  acc: null | number
  inputTimes: number[]
}

export type LocalState = {
  charset: Set<string>
  hideCursor: boolean
  done: boolean
  paused: boolean
  typed: (string | null)[][][]
  original: string[][][]
  stats: ParagraphStats[]
  pageStats: PageStats
  paragraphNum: number
  wordNum: number
  charNum: number
}

export type PromptData = {
  bookInfo: {
    id: string
    language: string | null
    title: string | null
  }
  chapterInfo: StaticChapterInfo | undefined
  paragraphs: string[] | null
}
