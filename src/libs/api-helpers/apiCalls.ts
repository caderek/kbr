import { fetchJSON } from "./fetchJSON"
import type { BooksIndex } from "../../types/common"

export function getBooksIndexLastUpdate() {
  console.log("Fetching last books index update")
  return fetchJSON("/books/_meta_/lastUpdate.json") as Promise<number>
}

export function getBooksIndex() {
  console.log("Fetching books index")
  return fetchJSON("/books/_meta_/index.json") as Promise<BooksIndex>
}
