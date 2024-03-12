import type { Book, Chapter, Cover } from "./types.ts"
import type {
  StaticBookInfo,
  StaticChapterInfo,
  StaticChapterContent,
} from "../../types/common.ts"

function serializeChapterInfo(chapter: Chapter, i: number): StaticChapterInfo {
  return {
    id: String(i).padStart(3, "0"),
    title: chapter.title,
    length: chapter.paragraphs.join(" ").length,
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
  cover: Cover
} {
  const info = {
    ...book.info,
    chapters: book.chapters.map(serializeChapterInfo),
  }

  const chapters = book.chapters.map(serializeChapterContent)

  return {
    info,
    chapters,
    cover: book.cover,
  }
}
