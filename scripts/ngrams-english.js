import fs from "node:fs"
import { getSpecificNgramsWithCount } from "./getSpecificNgrams.js"

const words = fs
  .readFileSync("public/wordlists/common-english-25k.txt", { encoding: "utf8" })
  .trim()
  .split("\n")

const bigrams = new Map(getSpecificNgramsWithCount(words, 2))

console.log(bigrams.size)
