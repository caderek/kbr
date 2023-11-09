import type { WordListData } from "../types/common"

export async function loadWordList(lang: string, size: number = 200) {
  const url = `/wordlists/${lang}-${size}.json`
  try {
    const res = await fetch(url)
    const data = await res.json()

    return data as WordListData
  } catch (e) {
    return new Error("Failed to fetch wordlist data.")
  }
}
