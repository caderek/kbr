import "./BookDetails.css"
import { useParams } from "@solidjs/router"
import {
  Component,
  createResource,
  createEffect,
  Show,
  For,
  createMemo,
} from "solid-js"
import Cover from "../../common/book/Cover"
import { StaticBookInfo } from "../../../types/common"
import config from "../../../config"
import storage from "../../../storage/storage"
import { formatNumNice, formatPercentageNice } from "../../../utils/formatters"

async function fetchBookDetails(id: string) {
  const res = await fetch(`/books/${id}/info.json`)
  const data = (await res.json()) as StaticBookInfo

  const chaptersStats = await storage.chaptersStats.get(id)
  const bookStats = await storage.booksStats.get(id)

  console.log({ data, bookStats })

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
  }
}

const BookDetails: Component = () => {
  const params = useParams()
  const [data] = createResource(params.id, fetchBookDetails)

  createEffect(() => {
    console.log(data())
  })

  return (
    <div class="book-details">
      <Show when={data()}>
        <section class="info" style={`--pages: ${data()?.pages}`}>
          <h2>{data()?.title}</h2>
          <Cover url={`/books/${params.id}/cover.min.png`} />
          <nav>
            <button>EDIT</button>
            <button class="primary">CONTINUE</button>
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
                  <strong>{formatPercentageNice(data()?.progress ?? 0)}</strong>
                  %
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Speed</figcaption>
                <p>
                  <strong>{formatNumNice(data()?.wpm ?? 0)}</strong> WPM
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Accuracy</figcaption>
                <p>
                  <strong>{formatPercentageNice(data()?.acc ?? 0)}</strong>%
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Consistency</figcaption>
                <p>
                  <strong>
                    {formatPercentageNice(data()?.consistency ?? 0)}
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
        <section class="chapters">
          <h2>Chapters</h2>
          <ul>
            <For
              each={data()?.chapters.filter(
                (chapter) => chapter.skip !== "always",
              )}
            >
              {(chapter) => {
                const pages = createMemo(() =>
                  Math.ceil(chapter.length / (5 * 300)),
                )

                const status = createMemo(() => {
                  if (chapter.skip === "yes") {
                    return "SKIPPED"
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
                      <span class="chapter-pages">
                        {pages()} page{pages() !== 1 ? "s" : ""}
                      </span>{" "}
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
