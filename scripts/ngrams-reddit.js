import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { getSpecificNgrams } from "./getSpecificNgrams.js"
import { getWordsWithNgrams } from "./getWordsWithNgrams.js"

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

function formatPercent(num) {
  return new Intl.NumberFormat("en-US", { style: "percent" }).format(num)
}

function main() {
  const monkeyWordlist = joinWordlists(
    cleanWordlist(readWordlist("monkey-english-200.json")),
    cleanWordlist(readWordlist("monkey-english-1k.json")),
    cleanWordlist(readWordlist("monkey-english-5k.json")),
    cleanWordlist(readWordlist("monkey-english-10k.json")),
  )

  const redditor =
    "abandoned accessories accountant adaptive administration advertisements advisory afraid analysis anthropology anywhere appearance applicable approximate architecture aromatherapy assistance atmospheric authorise automatically awesome bandwidth breakfast businesses calculate celebrity checklist chemical cholesterol circuits classify closest colleague colours compatibility competition composure compromise computers confidential consequences considerable constraints consultancy contemporary continuous convenience corresponding countryside created customer decade defendant definite deposit designing developed diagnostic differently directories discovery discrete dishwasher distributor drinking earthquake economic electrical encourage encyclopedia engaged enthusiasm entrepreneur everything examiner executable expertise explosive extensively extraordinary first fluorescent focused franchise friendship frontier gateway generator government hardware headquarters height helicopter hepatitis hockey hurricane indicates individuals instantly instrumental international inventory investigated justice laboratory lavender legitimate lighthouse linguistic longitude maintenance manufacturing meanwhile methodology microphone monopoly motherboard nephew newspaper northwest notorious observer operating opportunity orchestra organism originally parameters particular performance personality pesticide phosphate photography pleasant predator preparation procedure produce progression promotion proposal prototype provision published purchase qualify radioactive realistic receiver recommended referendum regulatory reinforced relationship remember remote representative researcher responsibilities rhetoric sandwich satellite screech selectively shareholder shaved shoulder showcase software soundtrack specifically statistics strengthen structural suppliers suppose surveillance technology thankfully thesaurus thousand threshold throughout tomorrow trademark transcripts transformation unchanged undergraduate unemployed unknown viewpoint whatever wholesale widescreen wildlife withdrawn workplace yourself".split(
      " ",
    )

  const trigrams = getSpecificNgrams(monkeyWordlist, 3)
  const trigramsX = getSpecificNgrams(redditor, 3)

  const useful = [...trigramsX].filter((w) => trigrams.has(w))

  console.log(trigrams.size, trigramsX.size, useful.length)

  const my = getWordsWithNgrams(monkeyWordlist, trigrams, 3, 200)

  console.log(redditor.length)
  console.log(my.length)

  console.log("Bigrams my:", getSpecificNgrams(my, 2).size)
  console.log("Trigrams my:", getSpecificNgrams(my, 3).size)
  console.log(
    "bigrams density",
    formatPercent(getSpecificNgrams(my, 2).size / my.join("").length),
  )
  console.log(
    "trigrams density",
    formatPercent(getSpecificNgrams(my, 3).size / my.join("").length),
  )

  console.log("Bigrams red:", getSpecificNgrams(redditor, 2).size)
  console.log("Trigrams red:", getSpecificNgrams(redditor, 3).size)
  console.log(
    "bigrams density",
    formatPercent(
      getSpecificNgrams(redditor, 2).size / redditor.join("").length,
    ),
  )
  console.log(
    "trigrams density",
    formatPercent(
      getSpecificNgrams(redditor, 3).size / redditor.join("").length,
    ),
  )

  console.log("-".repeat(60))
  console.log(my.sort().join(" "))
  console.log("-".repeat(60))
  console.log("len:", my.sort().length)

  writeFileSync("packed200.txt", my.sort().join(" "))
  writeFileSync("packed200x.txt", my.sort().join("\n"))
}

main()
