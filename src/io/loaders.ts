import type { WordListData } from "../types/common"

export async function loadWordList(name: string) {
  const url = `/wordlists/${name}.json`
  try {
    const res = await fetch(url)
    const data = await res.json()

    return data as WordListData
  } catch (e) {
    return new Error("Failed to fetch wordlist data.")
  }
}

export async function loadBookTxt(name: string) {
  const url = `/books/${name}.txt`
  try {
    const res = await fetch(url)
    return res.text()
  } catch (e) {
    return new Error("Failed to fetch book data.")
  }
}
