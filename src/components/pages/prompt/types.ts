import {
  FinishedParagraphStats,
  StaticChapterInfo,
} from "../../../types/common"

export type WordStats = {
  length: number
  typedLength: number
  times: number[][]
  isCorrect: boolean
  hadTypos: boolean
  typosIndicies: number[]
}

export type ParagraphStats = {
  charCount: number
  wordCount: number
  wpm: {
    value: number
    raw: number
    weight: number
    time: number
  } | null
  acc: {
    value: number
    weight: number
  } | null
  consistency: {
    value: number
    weight: number
  } | null
  inputTimes: number[]
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
  id: string | null
  length: number
  lengthCompleted: number
  charset: Set<string>
  hideCursor: boolean
  done: boolean
  paused: boolean
  typed: (string | null)[][][]
  original: string[][][]
  incrementalLength: number[][]
  screenSplits: number[]
  splitStart: number
  splitEnd: number
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
  chapterProgress: number
  paragraphs: string[] | null
  stats: FinishedParagraphStats[]
}
