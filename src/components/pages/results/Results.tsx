import "./Results.css"
import {
  Component,
  Show,
  createEffect,
  createMemo,
  createResource,
  onCleanup,
  onMount,
} from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import storage from "../../../storage/storage"
import { getBookInfo } from "../../../io/getBookInfo"
import { ChapterStats, StaticChapterInfo } from "../../../types/common"
import { FullscreenEffects } from "../../../libs/confetti/FullscreenEffects"
import state from "../../../state/state"

function getNextChapterId(
  currentChapterId: number,
  chaptersStats: ChapterStats[],
  chapters: StaticChapterInfo[],
) {
  for (
    let i = currentChapterId + 1;
    i < currentChapterId + chapters.length;
    i++
  ) {
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

async function fetchData(id: string) {
  const [bookId, chapterId] = id.split("__")
  const chapterNum = Number(chapterId)

  const chaptersStats = (await storage.chaptersStats.get(bookId)) ?? []
  const chapterStats = chaptersStats[chapterNum]
  const paragraphsStats = (await storage.paragraphsStats.get(id)) ?? []
  const bookStats = (await storage.booksStats.get(bookId)) ?? {}
  const bookInfo = await getBookInfo(bookId)

  const isBookComplete = bookInfo.chapters
    .filter((chapter) => chapter.skip === "no")
    .every((chapter) => {
      const stats = chaptersStats[Number(chapter.id)]
      return stats && stats.progress === 1
    })

  const nextChapterNum = isBookComplete
    ? 0
    : getNextChapterId(chapterNum, chaptersStats, bookInfo.chapters)

  const nextChapterInfo = bookInfo.chapters[nextChapterNum]
  const nextChapter = {
    path: `${bookInfo.id}__${nextChapterInfo.id}`,
    ...nextChapterInfo,
  }

  return {
    id,
    isBookComplete,
    nextChapter,
    bookInfo,
    bookId,
    chapterNum,
    bookStats,
    chapterStats,
    paragraphsStats,
  }
}

const Results: Component = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [data] = createResource(params.id, fetchData)

  const nextLink = createMemo(() => `/prompt/${data()?.nextChapter.path}`)
  const tocLink = createMemo(() => `/books/${data()?.bookInfo.id}#toc`)

  function handleShortcuts(e: KeyboardEvent) {
    if (e.key === "Enter") {
      navigate(nextLink())
      return
    }

    if (e.key === "Backspace") {
      navigate(tocLink())
      return
    }
  }

  createEffect(() => {
    if (state.get.loaded) {
      const fse = new FullscreenEffects()
      fse.init(state.get.settings.darkmode)
    }
  })

  onMount(() => {
    document.addEventListener("keydown", handleShortcuts)
  })

  onCleanup(() => {
    document.removeEventListener("keydown", handleShortcuts)
  })

  return (
    <Show when={data()}>
      <section class="results">
        <h2>Chapter Stats</h2>
        <Show when={!data()?.isBookComplete}>
          <h2>Next chapter</h2>
          <p>{data()?.nextChapter.title}</p>
        </Show>
        <Show when={data()?.isBookComplete}>
          <h2>Book Stats</h2>
        </Show>
        <a class="button" href={tocLink()}>
          TABLE OF CONTENTS
        </a>

        <Show when={!data()?.isBookComplete}>
          <a class="button primary" href={nextLink()}>
            CONTINUE
          </a>
        </Show>
        <Show when={data()?.isBookComplete}>
          <a class="button primary" href="/books">
            BACK TO LIBRARY
          </a>
        </Show>
      </section>
      <details>
        <summary>Data</summary>
        <pre>{JSON.stringify(data(), null, 2)}</pre>
      </details>
    </Show>
  )
}

export default Results
