import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { getSpecificNgrams } from "./getSpecificNgrams.js"
import { getWordsWithNgrams } from "./getWordsWithNgrams.js"

const ngramNames = {
  2: "bigrams",
  3: "trigrams",
  4: "tetragrams",
}

const steps = {
  2: 100,
  3: 200,
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
  const cleaned = words.map((word) => word.toLowerCase().split("-")).flat()

  return [...new Set(cleaned)]
}

function joinWordlists(...wordlists) {
  return [...new Set(wordlists.flat())]
}

function create(wordlistName, targetWords, frequencyWords, minCount = 1) {
  const OUTPUT_DIR = join("ngrams", "specific")

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  for (let ngramSize = 2; ngramSize < 4; ngramSize++) {
    const ngramsFrequency = getSpecificNgrams(
      frequencyWords,
      ngramSize,
      minCount,
    )
    const ngramsTarget = getSpecificNgrams(targetWords, ngramSize, 1)

    const ngrams = new Set(
      [...ngramsFrequency].filter((ngram) => ngramsTarget.has(ngram)),
    )

    console.log(`Total ${ngramNames[ngramSize]}:`, ngrams.size)

    const step = steps[ngramSize]

    for (let i = step; i < ngrams.size + step; i += step) {
      const subset = new Set([...ngrams].slice(0, i))

      const optimized = getWordsWithNgrams(targetWords, subset, ngramSize)

      console.log("-------------------------------")
      console.log(`${ngramNames[ngramSize]}`, subset.size)
      console.log("Words:", optimized.length)

      const file = `${wordlistName}-${ngramNames[ngramSize]}-top-${subset.size}__${optimized.length}-words.txt`

      writeFileSync(join(OUTPUT_DIR, file), optimized.sort().join(" "))
    }
  }
}

function main() {
  const monkeyWordlist = joinWordlists(
    cleanWordlist(readWordlist("monkey-english-200.json")),
    cleanWordlist(readWordlist("monkey-english-1k.json")),
    cleanWordlist(readWordlist("monkey-english-5k.json")),
    cleanWordlist(readWordlist("monkey-english-10k.json")),
  )

  const commonWordlist = cleanWordlist(readWordlist("common-english-10k.txt"))

  create("monkey-english", monkeyWordlist, monkeyWordlist, 2)
  create("common-english", commonWordlist, commonWordlist, 2)
}

main()
