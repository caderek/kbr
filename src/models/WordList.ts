import type { WordListData } from "../types/common"
import { randomElement } from "../utils/random"

type LessonOptions = {
  letters: string
  mustIncludeLetters: string
  wordlistMaxSize: number
  lettersCount: number
}

const hands = {
  qwerty: {
    left: new Set("qwertasdfgzxcv"),
    right: new Set("yuiophjklnm"),
  },
}

export class WordList {
  #data: WordListData
  #lettersByFrequency: string = ""
  #ngrams: string[] = []

  constructor(wordListData: WordListData) {
    this.#data = wordListData
  }

  getLesson(options: LessonOptions) {
    const subset = this.getSubset(options.letters, options.mustIncludeLetters)

    let lesson = ""

    while (lesson.length < options.lettersCount + 1) {
      lesson += randomElement(subset) + " "
    }

    return lesson.trim()
  }

  getSubset(letters: string, mustIncludeLetters: string = "") {
    const chars = new Set(letters)
    const requiredChars = [...mustIncludeLetters]

    return this.#data.words.filter(
      (word) =>
        [...word].every((l) => chars.has(l)) &&
        requiredChars.every((char) => word.includes(char)),
    )
  }

  get lettersByFrequency() {
    if (this.#lettersByFrequency !== "") {
      return this.#lettersByFrequency
    }

    const frequencies = new Map()

    for (const word of this.#data.words) {
      for (const char of word.toLowerCase()) {
        frequencies.set(char, (frequencies.get(char) ?? 0) + 1)
      }
    }

    const anyHandByFrequency = [...frequencies.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([letter]) => letter)

    const leftByFrequency = anyHandByFrequency.filter((l) =>
      hands.qwerty.left.has(l),
    )

    const rightByFrequency = anyHandByFrequency.filter((l) =>
      hands.qwerty.right.has(l),
    )

    const balancedByFrequency = []

    const largerHandLength = Math.max(
      leftByFrequency.length,
      rightByFrequency.length,
    )

    for (let i = 0; i < largerHandLength; i++) {
      if (leftByFrequency[i]) {
        balancedByFrequency.push(leftByFrequency[i])
      }

      if (rightByFrequency[i]) {
        balancedByFrequency.push(rightByFrequency[i])
      }
    }

    this.#lettersByFrequency = balancedByFrequency.join("")

    return this.#lettersByFrequency
  }

  #getWordNgrams(word: string) {
    const ngrams: string[] = []

    for (let len = 2; len <= 4; len++) {
      if (len > word.length) {
        break
      }

      for (let i = 0; i <= word.length - len; i++) {
        ngrams.push(word.slice(i, i + len))
      }
    }

    return ngrams
  }

  get words() {
    return this.#data.words
  }

  get ngrams() {
    if (this.#ngrams.length > 0) {
      return this.#ngrams
    }

    const ngramGroups: Map<number, Map<string, number>> = new Map()

    for (const word of this.#data.words) {
      const ngrams = this.#getWordNgrams(word)

      for (const ngram of ngrams) {
        if (!ngramGroups.has(ngram.length)) {
          ngramGroups.set(ngram.length, new Map())
        }

        const ngramGroup = ngramGroups.get(ngram.length) as Map<string, number>
        ngramGroup.set(ngram, (ngramGroup.get(ngram) ?? 0) + 1)
      }
    }

    const sortedNgramGroups = new Map()

    for (const [len, ngramGroup] of ngramGroups.entries()) {
      const sortedNgrams = [...ngramGroup.entries()]
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 1)

      sortedNgramGroups.set(len, sortedNgrams)
    }

    console.log(sortedNgramGroups)

    return this.#ngrams
  }
}
