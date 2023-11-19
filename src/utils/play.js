import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"

function getAlltWordNgrams(word, from = 2, to = 4) {
  const ngrams = []

  for (let ngramSize = to; ngramSize >= from; ngramSize--) {
    for (let i = 0; i <= word.length - ngramSize; i++) {
      const ngram = word.slice(i, i + ngramSize)

      // if (ngrams.some((x) => x.includes(ngram))) {
      //   continue
      // }

      ngrams.push(ngram)
    }
  }

  // for (let i = 0; i <= word.length - ngramSize; i++) {
  //   const ngram = word.slice(i, i + ngramSize)
  //   ngrams.push(ngram)
  // }

  return new Set(ngrams)
}

function getWordNgrams(word, ngramSize) {
  const ngrams = []

  for (let i = 0; i <= word.length - ngramSize; i++) {
    const ngram = word.slice(i, i + ngramSize)
    ngrams.push(ngram)
  }

  return new Set(ngrams)
}

function getNgrams(words, ngramSize, minCount = 1) {
  const ngramsWithCount = new Map()

  for (const word of words) {
    if (word.length < ngramSize) {
      continue
    }

    const ngrams = getWordNgrams(word, ngramSize)

    for (const ngram of ngrams) {
      ngramsWithCount.set(ngram, (ngramsWithCount.get(ngram) ?? 0) + 1)
    }
  }

  const sorted = [...ngramsWithCount.entries()]
    .filter(([_, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([ngram]) => ngram)

  return new Set(sorted)
}

function getWordsWithNgrams(words, ngrams, maxWords = Infinity) {
  const ngramSize = [...ngrams][0].length

  const ngramsCopy = new Set([...ngrams])
  const list = []

  let items = []

  for (const word of words) {
    const wordNgrams = new Set(
      [...getWordNgrams(word, ngramSize)].filter((ngram) =>
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

const lang = "en"
const wordlistSize = 200

const data1 = readFileSync(
  "public/wordlists/google-10000-english-no-swears.txt",
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter((word) => word.length > 1)

const data2 = JSON.parse(
  readFileSync(`public/wordlists/${lang}-${wordlistSize}.json`, {
    encoding: "utf8",
  }),
).words

//-------------------------------------------------------

// const minNgramOccurences = 1
// const ngramSize = 4
// const words = [
//   ...new Set(data2.map((word) => word.toLowerCase().split("-")).flat()),
// ]
// const ngrams = getNgrams(words, ngramSize, minNgramOccurences)
//
// const result = getWordsWithNgrams(words, ngrams)
// const finalNgrams = getNgrams(result, ngramSize)
//
// console.log(result.slice(-100))
// console.log({ finalListSize: result.length })
// console.log({ ngrams: ngrams.size })
// console.log({ finalNgrams: finalNgrams.size })
//
// const ngramNames = {
//   2: "bigrams",
//   3: "trigrams",
//   4: "tetragrams",
// }
//
// const DIR = "ngrams"
//
// if (!existsSync(DIR)) {
//   mkdirSync(DIR)
// }
//
// writeFileSync(
//   `${DIR}/${ngramNames[ngramSize]}-from-${lang}-${wordlistSize}__${finalNgrams.size}-${ngramNames[ngramSize]}_${result.length}-words.txt`,
//   result.sort().join(" "),
// )

const ngrams = getAlltWordNgrams("potato")

console.log(ngrams)
