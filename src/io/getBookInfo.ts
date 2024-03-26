import { fetchJSON } from "../libs/api-helpers/fetchJSON"
import storage from "../storage/storage"
import { StaticBookInfo } from "../types/common"

export async function getBookInfo(id: string): Promise<StaticBookInfo> {
  const cachedBookInfo = await storage.booksInfo.get(id)

  if (cachedBookInfo) {
    return cachedBookInfo
  }

  const bookInfo = await fetchJSON(`/books/${id}/info.json`)

  if (bookInfo) {
    await storage.booksInfo.set(id, bookInfo)
  }

  return bookInfo
}
