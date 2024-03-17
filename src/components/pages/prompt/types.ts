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
  inputTimes: number[]
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
