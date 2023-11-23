import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { getSpecificNgrams } from "./getSpecificNgrams.js"
import { getWordsWithNgrams } from "./getWordsWithNgrams.js"
import { calculateNgramDensity } from "./calculateNgramDensity.js"

const ngramNames = {
  2: "bigrams",
  3: "trigrams",
  4: "tetragrams",
}

const steps = {
  2: 100,
  3: 200,
  4: 200,
}

const RAW_WORDLISTS_DIR = join("public", "wordlists")

function readWordlist(file) {
  const path = join(RAW_WORDLISTS_DIR, file)

  if (file.endsWith("txt")) {
    return readFileSync(path, { encoding: "utf8" }).trim().split("\n")
  }

  if (file.startsWith("monkey")) {
    return JSON.parse(readFileSync(path, { encoding: "utf8" })).words
  }
}

function cleanWordlist(words) {
  const cleaned = words.map((word) => word.toLowerCase().split(/[-\s]+/)).flat()

  return [...new Set(cleaned)]
}

function joinWordlists(...wordlists) {
  return [...new Set(wordlists.flat())]
}

function skip(obj, keys) {
  const result = {}

  for (const [key, val] of Object.entries(obj)) {
    if (!keys.includes(key)) {
      result[key] = val
    }
  }

  return result
}

function verifyNgrams(words, expectedNgrams, ngramSize) {
  const actualNgrams = getSpecificNgrams(words, ngramSize)

  return [...expectedNgrams].every((ngram) => actualNgrams.has(ngram))
}

function calculateAvoidanceRatio(words, avoidWords) {
  const actual = new Set(words)
  const avoided = avoidWords.filter((word) => !actual.has(word))

  const ratio = avoided.length / avoidWords.length

  return Number.isNaN(ratio) ? 1 : ratio
}

function save(results) {
  const OUTPUT_DIR = join("ngrams", "specific")

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  for (const item of results) {
    const fileName = `${item.wordlistName}-${item.ngramName}-top-${item.ngramsCount}__${item.wordsCount}-words.txt`
    const outputPath = join(OUTPUT_DIR, fileName)
    writeFileSync(outputPath, item.words.join(" "))
  }
}

function createOptimizedWords({
  minWordLength,
  maxWordLength,
  targetWords,
  ngrams,
  ngramSize,
  sliceSize,
  wordlistName,
  allowAdditionalNgrams,
  avoidWords,
}) {
  let maxScore = 0
  let data = null

  for (
    let wordLength = minWordLength;
    wordLength <= maxWordLength;
    wordLength++
  ) {
    const words = targetWords.filter((word) => word.length <= wordLength)
    const subset = new Set([...ngrams].slice(0, sliceSize))

    const optimized = getWordsWithNgrams({
      words,
      ngrams: subset,
      maxNgram: ngramSize,
      allowAdditionalNgrams,
      avoidWords,
    }).sort()

    const density = calculateNgramDensity(optimized, subset, ngramSize)
    const avoidedanceRatio = calculateAvoidanceRatio(optimized, avoidWords)
    const isComplete = verifyNgrams(optimized, subset, ngramSize)

    const attempt = {
      wordlistName,
      ngramSize,
      ngramName: ngramNames[ngramSize],
      ngramsCount: subset.size,
      wordsCount: optimized.length,
      words: optimized,
      density,
      avoidedanceRatio,
    }

    const attemptScore = attempt.density + attempt.avoidedanceRatio

    if (isComplete && attemptScore > maxScore) {
      maxScore = attemptScore
      data = attempt
    }
  }

  return data
}

function create({
  wordlistName,
  targetWords,
  frequencyWords,
  ngramSize,
  minCount,
  step,
  avoidWords,
}) {
  wordlistName ??= ""
  minCount ??= 1
  frequencyWords ??= targetWords
  step ??= 100
  avoidWords ??= []

  const results = []

  const ngramsFrequency = getSpecificNgrams(frequencyWords, ngramSize, minCount)
  const ngramsTarget = getSpecificNgrams(targetWords, ngramSize, 1)

  const ngrams = new Set(
    [...ngramsFrequency].filter((ngram) => ngramsTarget.has(ngram)),
  )

  const minWordLength = ngramSize
  const maxWordLength = Math.max(...targetWords.map((w) => w.length))

  for (let i = step; i < ngrams.size + step; i += step) {
    const settings = {
      minWordLength,
      maxWordLength,
      targetWords,
      ngrams,
      ngramSize,
      sliceSize: i,
      wordlistName,
      avoidWords,
    }

    const data =
      createOptimizedWords({ ...settings, allowAdditionalNgrams: false }) ??
      createOptimizedWords({ ...settings, allowAdditionalNgrams: true })

    avoidWords = [...avoidWords, ...data.words]

    if (!data) {
      throw new Error("Cant produce a lists with current criteria!")
    }

    results.push(data)
  }

  return results
}

function main() {
  const monkeyWordlist = joinWordlists(
    cleanWordlist(readWordlist("monkey-english-200.json")),
    cleanWordlist(readWordlist("monkey-english-1k.json")),
    cleanWordlist(readWordlist("monkey-english-5k.json")),
    cleanWordlist(readWordlist("monkey-english-10k.json")),
  )

  const monkeyBigrams = create({
    wordlistName: "monkey-english",
    targetWords: monkeyWordlist,
    minCount: 2,
    ngramSize: 2,
    step: 100,
  })

  console.log(monkeyBigrams.map((x) => skip(x, ["words", "path"])))

  save(monkeyBigrams)

  // const monkeyTrigrams = create({
  //   wordlistName: "monkey-english",
  //   targetWords: monkeyWordlist,
  //   minCount: 2,
  //   ngramSize: 3,
  //   step: 200,
  // })
  //
  // console.log(monkeyTrigrams.map((x) => skip(x, ["words", "path"])))
  //
  // save(monkeyTrigrams)
}

main()
