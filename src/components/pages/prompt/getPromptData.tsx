import { fetchJSON } from "../../../../libs/api-helpers/fetchJSON.ts"
import { fetchLines } from "../../../../libs/api-helpers/fetchLines.ts"
import { StaticBookInfo } from "../../../../types/common.ts"

export async function getPromptData(id: string) {
  const [bookId, chapterId] = id.split("__")

  const info = (await fetchJSON(`/books/${bookId}/info.json`)) as StaticBookInfo
  const paragraphs = await fetchLines(`/books/${bookId}/${chapterId}.txt`)

  return {
    bookInfo: {
      id: bookId,
      language: info.language,
      title: info.title,
    },
    chapterInfo: info.chapters.find((chapter) => chapter.id === chapterId),
    paragraphs,
  }
}
