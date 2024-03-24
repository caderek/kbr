import { fetchJSON } from "../../../../libs/api-helpers/fetchJSON.ts"
import { fetchLines } from "../../../../libs/api-helpers/fetchLines.ts"
import storage from "../../../../storage/storage.ts"
import type { StaticBookInfo } from "../../../../types/common.ts"
import type { PromptData } from "../types.ts"

export async function getPromptData(id: string): Promise<PromptData> {
  const [bookId, chapterId] = id.split("__")

  const info = (await fetchJSON(`/books/${bookId}/info.json`)) as StaticBookInfo
  const paragraphs = await fetchLines(`/books/${bookId}/${chapterId}.txt`)
  const savedParagraphsStats = (await storage.paragraphsStats.get(id)) ?? []
  const savedChaptersStats = (await storage.chaptersStats.get(bookId)) ?? []
  const chapterProgress = savedChaptersStats[Number(chapterId)]?.progress ?? 0

  return {
    bookInfo: {
      id: bookId,
      language: info.language,
      title: info.title,
    },
    chapterInfo: info.chapters.find((chapter) => chapter.id === chapterId),
    chapterProgress,
    paragraphs,
    stats: savedParagraphsStats,
  }
}
