import fs from "node:fs"

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

let words = fs
  .readFileSync("ngrams/packed/packed__all_bigrams.txt", { encoding: "utf8" })
  .split(" ")

shuffleArray(words)

let i = 1
const chunkSize = 10
const maxLength = String(Math.ceil(words.length / chunkSize)).length

while (words.length) {
  const chunk = words.slice(0, chunkSize)
  words = words.slice(chunkSize)
  fs.writeFileSync(
    `ngrams/packed/packed__all_bigrams_part_${String(i).padStart(
      maxLength,
    )}.txt`,
    chunk.join(" "),
  )
  i++
}
