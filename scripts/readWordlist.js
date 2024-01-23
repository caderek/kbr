import { readFileSync } from "node:fs"
import { join } from "node:path"
const RAW_WORDLISTS_DIR = join("public", "wordlists")

export function readWordlist(file) {
  const path = join(RAW_WORDLISTS_DIR, file)

  if (file.endsWith("txt")) {
    return readFileSync(path, { encoding: "utf8" }).trim().split("\n")
  }

  if (file.startsWith("monkey")) {
    return JSON.parse(readFileSync(path, { encoding: "utf8" })).words
  }
}
