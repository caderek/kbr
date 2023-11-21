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

console.log(words.slice(0, 100))

const common200 = words.slice(0, 200).map(([w]) => w)
const common1k = words.slice(0, 1e3).map(([w]) => w)
const common5k = words.slice(0, 5e3).map(([w]) => w)
const common10k = words.slice(0, 10e3).map(([w]) => w)

fs.writeFileSync(
  "public/wordlists/common-english-200.txt",
  common200.join("\n"),
)
fs.writeFileSync("public/wordlists/common-english-1k.txt", common1k.join("\n"))
fs.writeFileSync("public/wordlists/common-english-5k.txt", common5k.join("\n"))
fs.writeFileSync(
  "public/wordlists/common-english-10k.txt",
  common10k.join("\n"),
)

console.log("Words:", words.length)
