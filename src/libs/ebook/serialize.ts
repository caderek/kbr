import type { Book, Chapter } from "./types.ts"
import type {
  StaticBookInfo,
  StaticChapterInfo,
  StaticChapterContent,
} from "../../types/common.ts"

function serializeChapterInfo(chapter: Chapter, i: number): StaticChapterInfo {
  return {
    id: String(i).padStart(3, "0"),
    title: chapter.title,
    length: chapter.paragraphs
      .map((p) => p.length + 1)
      .reduce((a, b) => a + b, 0),
    skip: "no",
  }
}

function serializeChapterContent(
  chapter: Chapter,
  i: number,
): StaticChapterContent {
  return {
    id: String(i).padStart(3, "0"),
    text: chapter.paragraphs.join("\n"),
  }
}

export function serializeBook(book: Book): {
  info: StaticBookInfo
  chapters: StaticChapterContent[]
  cover: Blob | null
} {
  const info = {
    ...book.info,
    chapters: book.chapters.map(serializeChapterInfo),
    createdAt: Date.now(),
  }

  const chapters = book.chapters.map(serializeChapterContent)

  return {
    info,
    chapters,
    cover: book.cover,
  }
}
