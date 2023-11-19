import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"

function getWordNgrams(word, ngramSize) {
  const ngrams = []

  for (let i = 0; i <= word.length - ngramSize; i++) {
    const ngram = word.slice(i, i + ngramSize)
    ngrams.push(ngram)
  }

  return new Set(ngrams)
}

function getMaxWordNgrams(word, maxNgram) {
  const ngrams = []

  const ngramSize = Math.min(word.length, maxNgram)

  for (let i = 0; i <= word.length - ngramSize; i++) {
    const ngram = word.slice(i, i + ngramSize)

    ngrams.push(ngram)
  }

  return new Set(ngrams)
}

function getMaxNgrams(words, maxNgram, minCount = 1) {
  const ngramsWithCount = new Map()

  for (const word of words) {
    const ngrams = getMaxWordNgrams(word, maxNgram)
    const ngramSize = [...ngrams][0].length

    if (!ngramsWithCount.has(ngramSize)) {
      ngramsWithCount.set(ngramSize, new Map())
    }

    for (const ngram of ngrams) {
      ngramsWithCount
        .get(ngramSize)
        .set(ngram, (ngramsWithCount.get(ngram) ?? 0) + 1)
    }
  }

  const usedNgrams = []
  const joined = new Map()

  const ngramsWithCountFromLongest = [...ngramsWithCount.entries()].sort(
    ([a], [b]) => b - a,
  )

  for (const [_, counts] of ngramsWithCountFromLongest) {
    for (const [ngram, count] of counts.entries()) {
      const usedNgram = usedNgrams.find((x) => x.includes(ngram))

      if (usedNgram) {
        joined.set(usedNgram, joined.get(usedNgram) + count)
        continue
      }

      joined.set(ngram, count)
      usedNgrams.push(ngram)
    }
  }

  const sorted = [...joined.entries()]
    .filter(([_, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([ngram]) => ngram)

  return new Set(sorted)
}

function getWordsWithNgrams(words, ngrams, maxNgram, maxWords = Infinity) {
  const ngramsCopy = new Set([...ngrams])
  const list = []

  let items = []

  for (const word of words) {
    const wordNgrams = new Set(
      [...getMaxWordNgrams(word, maxNgram)].filter((ngram) =>
        ngramsCopy.has(ngram),
      ),
    )

    if (wordNgrams.size > 0) {
      items.push({ word, ngrams: wordNgrams })
    }
  }

  while (items.length && list.length < maxWords) {
    const byNgramsCountThenByShortest = items.sort(
      (a, b) => b.ngrams.size - a.ngrams.size || a.word.length - b.word.length,
    )

    const best = byNgramsCountThenByShortest[0]
    list.push(best.word)
    items = byNgramsCountThenByShortest.slice(1)

    for (const used of best.ngrams) {
      ngramsCopy.delete(used)
    }

    for (const item of items) {
      for (const used of best.ngrams) {
        item.ngrams.delete(used)
      }
    }

    items = items.filter(({ ngrams }) => ngrams.size > 0)
  }

  return list
}

//-------------------------------------------------------

// const lang = "en-noice"
const lang = "en"
const wordlistSize = 450000

// const data1 = readFileSync(
//   "public/wordlists/google-10000-english-no-swears.txt",
//   { encoding: "utf8" },
// )
//   .trim()
//   .split("\n")
//   .filter((word) => word.length > 1)

const data2 = JSON.parse(
  readFileSync(`public/wordlists/${lang}-${wordlistSize}.json`, {
    encoding: "utf8",
  }),
).words

const data = data2

//-------------------------------------------------------

const maxNgram = 3
const minNgramOccurences = 1
const words = [
  ...new Set(data.map((word) => word.toLowerCase().split("-")).flat()),
]
const ngrams = getMaxNgrams(words, maxNgram, minNgramOccurences)

const result = getWordsWithNgrams(words, ngrams, maxNgram)
const finalNgrams = getMaxNgrams(result, maxNgram, minNgramOccurences)

console.log(result.slice(-100))
console.log({ finalListSize: result.length })
console.log({ ngrams: ngrams.size })
console.log({ finalNgrams: finalNgrams.size })

const DIR = "ngrams"

if (!existsSync(DIR)) {
  mkdirSync(DIR)
}

writeFileSync(
  `${DIR}/ngrams${maxNgram}-from-${lang}-${wordlistSize}__${finalNgrams.size}-ngrams_${result.length}-words.txt`,
  result.sort().join(" "),
)
