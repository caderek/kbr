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
  const cleaned = words
    .map((word) => word.toLowerCase().split(/[-'\s]+/))
    .flat()
    .filter((word) => word.length > 1)

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
  const avoided = [...avoidWords].filter((word) => !actual.has(word))

  const ratio = avoided.length / avoidWords.size

  return Number.isNaN(ratio) ? 1 : ratio
}

function save(results) {
  const OUTPUT_DIR = join("ngrams", "specific")

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const meta = []

  for (const [index, item] of results.entries()) {
    const fileName = `lesson-${String(index + 1).padStart(2, "0")}__${
      item.wordlistName
    }-${item.ngramName}-top-${item.sliceStart}-${
      item.sliceStart + item.ngramsCount
    }.txt`
    const outputPath = join(OUTPUT_DIR, fileName)
    writeFileSync(outputPath, item.words.join(" "))

    const metaItem = {
      ...skip(item, ["words"]),
      path: outputPath,
      lesson: index + 1,
    }
    meta.push(metaItem)
  }

  writeFileSync(join(OUTPUT_DIR, `meta.json`), JSON.stringify(meta))
}

function getSteps(ngramsSize, step) {
  const steps = []

  for (let i = step; i < ngramsSize + step; i += step) {
    if (i !== step) {
      steps.push({ sliceStart: i - step, sliceEnd: i })
    }

    steps.push({ sliceStart: 0, sliceEnd: i })
  }

  return steps
}

function createOptimizedWords({
  minWordLength,
  maxWordLength,
  targetWords,
  ngrams,
  ngramSize,
  sliceStart,
  sliceEnd,
  wordlistName,
  allowAdditionalNgrams,
  avoidWords,
}) {
  let maxScore = 0
  let data = null

  // const avoidVariants = [new Set(), avoidWords]
  const avoidVariants = [avoidWords]

  for (const avoid of avoidVariants) {
    for (
      let wordLength = minWordLength;
      wordLength <= maxWordLength;
      wordLength++
    ) {
      const words = targetWords.filter((word) => word.length <= wordLength)
      const subset = new Set([...ngrams].slice(sliceStart, sliceEnd))

      const optimized = getWordsWithNgrams({
        words,
        ngrams: subset,
        maxNgram: ngramSize,
        allowAdditionalNgrams,
        avoidWords: avoid,
      }).sort()

      const density = calculateNgramDensity(optimized, subset, ngramSize)
      const avoidedanceRatio = calculateAvoidanceRatio(optimized, avoidWords)
      const isComplete = verifyNgrams(optimized, subset, ngramSize)
      const howMany = getSpecificNgrams(optimized, ngramSize).size
      const attempt = {
        wordlistName,
        ngramSize,
        ngramName: ngramNames[ngramSize],
        ngramsCount: subset.size,
        ngramsTotalCount: howMany,
        sliceStart,
        sliceEnd,
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
  avoidWords ??= new Set()

  const results = []

  const ngramsFrequency = getSpecificNgrams(frequencyWords, ngramSize, minCount)
  const ngramsTarget = getSpecificNgrams(targetWords, ngramSize, 1)

  const ngrams = new Set(
    [...ngramsFrequency].filter((ngram) => ngramsTarget.has(ngram)),
  )

  const minWordLength = ngramSize
  const maxWordLength = Math.max(...targetWords.map((w) => w.length))

  const steps = getSteps(ngrams.size, step)

  for (const { sliceStart, sliceEnd } of steps) {
    const settings = {
      minWordLength,
      maxWordLength,
      targetWords,
      ngrams,
      ngramSize,
      sliceStart,
      sliceEnd,
      wordlistName,
      avoidWords,
    }

    const data =
      createOptimizedWords({ ...settings, allowAdditionalNgrams: false }) ??
      createOptimizedWords({ ...settings, allowAdditionalNgrams: true })

    avoidWords = new Set([...avoidWords, ...data.words])

    if (!data) {
      throw new Error("Cant produce a lists with current criteria!")
    }

    results.push(data)
    console.log(`${data.ngramName} ${data.sliceStart}-${data.sliceEnd} done!`)
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

  const usedWords = new Set()

  const bigramResults = create({
    wordlistName: `monkey-english`,
    targetWords: monkeyWordlist,
    minCount: 1,
    ngramSize: 2,
    step: 100,
    avoidWords: usedWords,
  })

  const bigramWords = bigramResults.map((item) => item.words).flat()

  for (const word of bigramWords) {
    usedWords.add(word)
  }

  console.log(bigramResults.map((x) => skip(x, ["words", "path"])))

  const trigramResults = create({
    wordlistName: "monkey-english",
    targetWords: monkeyWordlist,
    minCount: 1,
    ngramSize: 3,
    step: 200,
    avoidWords: usedWords,
  })

  const trigramWords = trigramResults.map((item) => item.words).flat()

  for (const word of trigramWords) {
    usedWords.add(word)
  }

  console.log(trigramResults.map((x) => skip(x, ["words", "path"])))

  save([...bigramResults, ...trigramResults])

  // const unused = monkeyWordlist.filter((word) => !usedWords.has(word))
  // console.log(unused.join(" "))
  console.log({ allWords: monkeyWordlist.length, usdWords: usedWords.size })
}

main()
