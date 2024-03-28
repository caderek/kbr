import "./Results.css"
import {
  Component,
  Show,
  createMemo,
  createResource,
  onCleanup,
  onMount,
} from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import storage from "../../../storage/storage"
import { getBookInfo } from "../../../io/getBookInfo"
import Confetti from "./Confetti"
import { getNextChapterId } from "../../../actions/getNextChapterId"

async function fetchData(id: string) {
  const [bookId, chapterId] = id.split("__")
  const chapterNum = Number(chapterId)

  const chaptersStats = await storage.chaptersStats.get(bookId)
  const chapterStats = chaptersStats?.[chapterNum]
  const paragraphsStats = (await storage.paragraphsStats.get(id)) ?? {}
  const bookStats = await storage.booksStats.get(bookId)
  const bookInfo = await getBookInfo(bookId)

  const isBookComplete = bookStats?.progress === 1

  const nextChapterNum = getNextChapterId({
    currentChapterIndex: chapterNum,
    chaptersStats: chaptersStats ?? {},
    chapters: bookInfo.chapters,
    progress: bookStats?.progress ?? 0,
  })

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
        <Show when={data()?.isBookComplete}>
          <Confetti />
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
