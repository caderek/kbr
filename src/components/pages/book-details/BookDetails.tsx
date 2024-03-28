import "./BookDetails.css"
import { useParams, useLocation } from "@solidjs/router"
import {
  Component,
  createResource,
  Show,
  For,
  createMemo,
  createEffect,
  onMount,
} from "solid-js"
import Cover from "../../common/book/Cover"
import config from "../../../config"
import storage from "../../../storage/storage"
import {
  formatNum,
  formatNumNice,
  formatPercentage,
  formatPercentageNice,
} from "../../../utils/formatters"
import { getBookInfo } from "../../../io/getBookInfo"
import { getNextChapterId } from "../../../actions/getNextChapterId"

async function fetchBookDetails(id: string) {
  const data = await getBookInfo(id)

  const chaptersStats = await storage.chaptersStats.get(id)
  const bookStats = await storage.booksStats.get(id)

  const nextChapterNum = getNextChapterId({
    currentChapterIndex: bookStats?.lastChapter ?? 0,
    chaptersStats: chaptersStats ?? {},
    chapters: data.chapters,
    progress: bookStats?.progress ?? 0,
  })

  const chapters = data.chapters.map((chapter) => {
    const chapterStats = chaptersStats && chaptersStats[Number(chapter.id)]

    return {
      ...chapter,
      wpm: chapterStats?.wpm.value ?? null,
      acc: chapterStats?.acc.value ?? null,
      consistency: chapterStats?.consistency.value ?? null,
      progress: chapterStats?.progress ?? 0,
      typedLength: chapterStats?.length ?? 0,
    }
  })

  const totalPages = Math.ceil(
    data.chapters
      .filter((chapter) => chapter.skip === "no")
      .map((chapter) => chapter.length)
      .reduce((sum, x) => sum + x, 0) / config.CHARACTERS_PER_PAGE,
  )

  const typedLength = bookStats?.length ?? 0
  const pages = typedLength / config.CHARACTERS_PER_PAGE

  return {
    ...data,
    pages,
    totalPages,
    chapters,
    wpm: bookStats?.wpm.value ?? null,
    acc: bookStats?.acc.value ?? null,
    consistency: bookStats?.consistency.value ?? null,
    progress: bookStats?.progress ?? 0,
    typedLength,
    nextChapterNum,
  }
}

const BookDetails: Component = () => {
  const location = useLocation()
  const params = useParams()
  const [data] = createResource(params.id, fetchBookDetails)

  onMount(() => {
    createEffect(() => {
      if (location.hash && data()) {
        document.querySelector(location.hash)?.scrollIntoView()
      }
    })
  })

  const nextChapter = createMemo(() => {
    const chaptetId = String(data()?.nextChapterNum ?? 0).padStart(3, "0")

    return {
      link: `/prompt/${params.id}__${chaptetId}`,
      text:
        data()?.progress === 1
          ? "TYPE AGAIN"
          : data()?.progress === 0
            ? "START"
            : "CONTINUE",
    }
  })

  return (
    <div class="book-details">
      <Show when={data()}>
        <section class="info" style={`--pages: ${data()?.pages}`}>
          <h2>{data()?.title}</h2>
          <Cover url={`/books/${params.id}/cover.min.png`} />
          <nav>
            {/* <button>EDIT</button> */}
            <a class="button primary" href={nextChapter().link}>
              {nextChapter().text}
            </a>
          </nav>
          <p class="author">
            by <a href="#">{data()?.author}</a>
          </p>
          <ul class="tags">
            <For each={data()?.genres}>
              {(tag) => (
                <li>
                  <a href="#">{tag}</a>
                </li>
              )}
            </For>
          </ul>
          <p class="source">
            Source:{" "}
            <Show
              when={data()?.source?.isUrl}
              fallback={data()?.source?.value ?? "unknown"}
            >
              <a href={data()?.source?.value} target="_blank">
                {data()?.source?.value}
              </a>
            </Show>
          </p>
          <ul class="stats">
            {/* <li> */}
            {/*   <figure> */}
            {/*     <figcaption>Pages</figcaption> */}
            {/*     <p> */}
            {/*       <strong>{formatNumNice(data()?.pages ?? 0)}</strong>/ */}
            {/*       {data()?.totalPages} */}
            {/*     </p> */}
            {/*   </figure> */}
            {/* </li> */}
            <li>
              <figure>
                <figcaption>Progress</figcaption>
                <p>
                  <strong>
                    {formatPercentageNice(data()?.progress ?? 0, 1)}
                  </strong>
                  %
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Speed</figcaption>
                <p>
                  <strong>{formatNumNice(data()?.wpm ?? 0, 1)}</strong> WPM
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Accuracy</figcaption>
                <p>
                  <strong>{formatPercentageNice(data()?.acc ?? 0, 1)}</strong>%
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Consistency</figcaption>
                <p>
                  <strong>
                    {formatPercentageNice(data()?.consistency ?? 0, 1)}
                  </strong>
                  %
                </p>
              </figure>
            </li>
          </ul>
          <article class="description">
            <For each={data()?.longDescription ?? []}>
              {(par) => <p>{par}</p>}
            </For>
          </article>
          <p class="rights">
            <strong>Rights: </strong>
            {data()?.rights ?? "no info"}
          </p>
        </section>
        <hr />
        <section class="chapters" id="toc">
          <h2>Chapters</h2>
          <ul>
            <For
              each={data()?.chapters.filter(
                (chapter) => chapter.skip !== "always",
              )}
            >
              {(chapter) => {
                const pages = createMemo(() =>
                  Math.ceil(chapter.length / config.CHARACTERS_PER_PAGE),
                )

                const status = createMemo(() => {
                  if (chapter.skip === "yes") {
                    return "SKIP"
                  }

                  if (chapter.progress === 1) {
                    return "DONE"
                  }

                  if (chapter.progress > 0) {
                    return formatPercentageNice(chapter.progress) + "%"
                  }

                  return ""
                })

                return (
                  <li classList={{ skipped: chapter.skip === "yes" }}>
                    <a href={`/prompt/${data()?.id}__${chapter.id}`}>
                      <p class="chapter-title">{chapter.title}</p>
                    </a>
                    <div class="chapter-right">
                      <Show when={chapter.wpm}>
                        <span class="chapter-stat">
                          {formatNum(chapter.wpm ?? 0)} wpm
                        </span>
                      </Show>
                      <Show when={chapter.acc}>
                        <span class="chapter-stat">
                          {formatPercentage(chapter.acc ?? 0)} acc
                        </span>
                      </Show>
                      <Show when={chapter.consistency}>
                        <span class="chapter-stat">
                          {formatPercentage(chapter.consistency ?? 0)} con
                        </span>
                      </Show>
                      <span class="chapter-stat">
                        {pages()} page{pages() !== 1 ? "s" : ""}
                      </span>
                      <span class="chapter-status">{status()}</span>
                      <span class="chapter-skip">
                        <label>
                          <i
                            class={`icon-toggle-${
                              chapter.skip === "no" ? "on" : "off"
                            }`}
                          />
                          <input type="checkbox" />
                        </label>
                      </span>
                    </div>
                  </li>
                )
              }}
            </For>
          </ul>
        </section>
      </Show>
    </div>
  )
}

export default BookDetails
