import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { getLongestNgrams } from "./getLongestNgrams.js"
import { getWordsWithNgrams } from "./getWordsWithNgrams.js"
import { getSpecificNgrams } from "./getSpecificNgrams.js"

const ngramNames = {
  2: "bigrams",
  3: "trigrams",
  4: "tetragrams",
}

const RAW_WORDLISTS_DIR = join("public", "wordlists")
const OUTPUT_DIR = "ngrams"

function readWordlist(file) {
  const path = join(RAW_WORDLISTS_DIR, file)

  if (file.startsWith("google")) {
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

function saveWordlist(file, words, separator = " ") {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  writeFileSync(join(OUTPUT_DIR, file), words.join(separator))
}

function formatPercent(num) {
  return new Intl.NumberFormat("en-US", { style: "percent" }).format(num)
}

function capitalize(text) {
  return text
    .split(/[\s-]/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")
}

function getNgramCounts(words) {
  return {
    bigrams: getSpecificNgrams(words, 2).size,
    trigrams: getSpecificNgrams(words, 3).size,
    tetragrams: getSpecificNgrams(words, 4).size,
  }
}

function getFullStats(original, condensed) {
  const originalCounts = getNgramCounts(original)
  const condensedCounts = getNgramCounts(condensed)
  const fullStats = {
    ngrams: {},
  }

  for (const [ngramName, originalCount] of Object.entries(originalCounts)) {
    const condensedCount = condensedCounts[ngramName]
    const ratio = condensedCount / originalCount

    const name = ngramName[0].toUpperCase() + ngramName.slice(1)

    fullStats.ngrams[ngramName] = {
      ratio,
      text: `${name}: ${condensedCount}/${originalCount} (${formatPercent(
        ratio,
      )})`,
    }
  }

  const wordsRatio = condensed.length / original.length

  fullStats.words = {
    ratio: wordsRatio,
    text: `Original ${original.length} words condensed to ${
      condensed.length
    } words (${formatPercent(wordsRatio)})`,
  }

  const originalCharacters = original.join(" ").length
  const condensedCharacters = condensed.join(" ").length
  const charactersRatio = condensedCharacters / originalCharacters

  fullStats.characters = {
    ratio: charactersRatio,
    text: `Original ${originalCharacters} characters condensed to ${condensedCharacters} characters (${formatPercent(
      charactersRatio,
    )})`,
  }

  return fullStats
}

function createNgrams(files, maxNgram, minOccurences = 1) {
  const docs = []

  for (const file of files) {
    const [originalName] = file.split(".")
    const completeness = minOccurences === 1 ? "all" : "common"
    const outputFile = `${completeness}-${ngramNames[maxNgram]}__${originalName}.txt`

    const original = cleanWordlist(readWordlist(file))

    const ngrams = getLongestNgrams(original, maxNgram)

    const condensed = getWordsWithNgrams(original, ngrams, maxNgram)

    const stats = getFullStats(original, condensed)

    const description = [
      `### Optimized ${capitalize(originalName)} (${ngramNames[maxNgram]})\n`,
      "- " + stats.words.text,
      "- " + stats.characters.text + "\n",
      "Preserved N-grams:\n",
      "- " + stats.ngrams.bigrams.text,
      "- " + stats.ngrams.trigrams.text,
      "- " + stats.ngrams.tetragrams.text,
      `\nGet it here: [${outputFile}](https://raw.githubusercontent.com/caderek/kbr/main/ngrams/${outputFile})`,
    ].join("\n")

    docs.push(description)

    saveWordlist(outputFile, condensed)

    console.log(`Done: ${capitalize(originalName)} (${ngramNames[maxNgram]})`)
  }

  return [
    `## ${ngramNames[maxNgram].toUpperCase()}`,
    docs.join("\n\n---\n\n"),
  ].join("\n\n")
}

function main() {
  const files = [
    "monkey-english.json",
    "monkey-english-1k.json",
    "monkey-english-5k.json",
    "monkey-english-10k.json",
    "monkey-english-25k.json",
    "monkey-english-450k.json",
  ]

  const intro = `
# Optimized wordlists for typing software
`

  const docs = [
    intro,
    createNgrams(files, 2),
    createNgrams(files, 3),
    createNgrams(files, 4),
  ].join("\n\n")

  console.log(docs)

  writeFileSync(join(OUTPUT_DIR, "README.md"), docs)
}

main()
