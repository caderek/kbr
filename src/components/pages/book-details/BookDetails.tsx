import "./BookDetails.css"
import { useParams } from "@solidjs/router"
import { Component, createResource, createEffect, Show, For } from "solid-js"
import Cover from "../../common/book/Cover"
import { StaticBookInfo } from "../../../types/common"

type Params = {}

async function fetchBookDetails(id: string) {
  const res = await fetch(`/books/${id}/info.json`)
  const data = (await res.json()) as StaticBookInfo

  console.log({ data })

  return {
    ...data,
    pages: Math.ceil(
      data.chapters
        .filter((chapter) => chapter.skip === "no")
        .map((chapter) => chapter.length)
        .reduce((sum, x) => sum + x, 0) /
        (5 * 300),
    ),
  }
}

const BookDetails: Component<Params> = () => {
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
            <li>
              <figure>
                <figcaption>Pages</figcaption>
                <p>
                  <strong>36</strong>/{data()?.pages}
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Progress</figcaption>
                <p>
                  <strong>30</strong>%
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Average speed</figcaption>
                <p>
                  <strong>60</strong> WPM
                </p>
              </figure>
            </li>
            <li>
              <figure>
                <figcaption>Average accuracy</figcaption>
                <p>
                  <strong>97</strong>%
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
              {(chapter) => (
                <li classList={{ skipped: chapter.skip === "yes" }}>
                  <a href="/prompt">
                    <p class="chapter-title">{chapter.title}</p>
                  </a>
                  <div class="chapter-right">
                    <span class="chapter-pages">
                      {Math.ceil(chapter.length / (5 * 300))} pages
                    </span>{" "}
                    <span class="chapter-status">STATUS</span>
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
              )}
            </For>
          </ul>
        </section>
      </Show>
    </div>
  )
}

export default BookDetails
