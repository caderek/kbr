export type WordListData = {
  name: string
  words: string[]
}

export type State = {
  lang: "en" | "pl"
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
  }
}
