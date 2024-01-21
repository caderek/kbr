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

while (words.length) {
  const chunk = words.slice(0, 20)
  words = words.slice(20)
  fs.writeFileSync(
    `ngrams/packed/packed__all_bigrams_part_${i}.txt`,
    chunk.join(" "),
  )
  i++
}
