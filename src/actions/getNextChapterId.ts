import { ChapterStats, StaticChapterInfo } from "../types/common"

type Args = {
  currentChapterIndex: number
  chaptersStats: { [index: number]: ChapterStats }
  chapters: StaticChapterInfo[]
  progress: number
}

export function getNextChapterId({
  currentChapterIndex: curr,
  chaptersStats,
  chapters,
  progress,
}: Args) {
  if (progress === 0 || progress === 1) {
    return Math.max(
      0,
      chapters.findIndex((c) => c.skip === "no"),
    )
  }

  for (let i = curr; i < curr + chapters.length; i++) {
    const index = i % chapters.length

    if (
      chapters[index].skip === "no" &&
      (!chaptersStats[index] || chaptersStats[index].progress < 1)
    ) {
      return index
    }
  }

  return 0
}
