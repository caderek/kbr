import fs from "node:fs"

const dict = new Set(
  fs
    .readFileSync("public/wordlists/dictionary_english.txt", {
      encoding: "utf8",
    })
    .trim()
    .split("\r\n")
    .map((x) => x.trim().toLowerCase())
    .filter((x) => /^[a-z]+$/.test(x)),
)

const bad = new Set(
  JSON.parse(
    fs.readFileSync("public/wordlists/profanities_english.json", {
      encoding: "utf8",
    }),
  )
    .map((x) => x.trim().toLowerCase())
    .filter((x) => /^[a-z]+$/.test(x)),
)

const words = fs
  .readFileSync("public/wordlists/corpus_english.txt", {
    encoding: "utf8",
  })
  .trim()
  .split("\n")
  .map((line) => {
    const [word, count] = line.split(/[\n\t]+/).map((x) => x.trim())
    return [word, Number(count)]
  })
  .filter(
    ([word]) =>
      /^[a-z]+$/.test(word) &&
      word.length > 1 &&
      !bad.has(word) &&
      dict.has(word),
  )
  .sort(([, countA], [, countB]) => countB - countA)
  .map(([word]) => word)

const wordlists = {
  "common-english-200": words.slice(0, 200),
  "common-english-1k": words.slice(0, 1e3),
  "common-english-5k": words.slice(0, 5e3),
  "common-english-10k": words.slice(0, 10e3),
  "common-english-25k": words.slice(0, 25e3),
}

for (const [name, words] of Object.entries(wordlists)) {
  fs.writeFileSync(`public/wordlists/${name}.txt`, words.join("\n"))
}

console.log("Done!")
