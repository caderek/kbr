export type WordListData = {
  name: string
  words: string[]
}

export type State = {
  lang: "en" | "pl"
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
    text: string
    done: boolean
    wpm: number
  }
}
