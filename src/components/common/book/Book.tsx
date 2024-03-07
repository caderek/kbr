import "./Book.css"
import { Component, Show, For } from "solid-js"
import Cover from "./Cover"

const WEEK_MS = 1000 * 60 * 60 * 24 * 7

type Props = {
  coverUrl: string
  title: string
  author: string
  description: string
  pages: number
  progress: number
  favorite: boolean
  dateAdded: number
  genres: string[]
}

function formatProgress(progress: number) {
  return Math.floor(progress * 100)
}

const Book: Component<Props> = (props) => {
  return (
    <article class="book" style={`--pages: ${props.pages}`}>
      <Cover url={props.coverUrl} />
      <div class="scroll-box">
        <div class="info">
          <h3>{props.title}</h3>
          <p class="author">
            by <a href="#">{props.author}</a>
          </p>
          <p class="description">{props.description}</p>
          <ul class="stats">
            <li>
              <span>{props.pages} pages</span>
            </li>
            <Show when={props.progress === 1}>
              <li class="done">
                <a href="#">Done!</a>
              </li>
            </Show>
            <Show when={props.progress > 0 && props.progress < 1}>
              <li class="in-progress" title="Show all in progress">
                <a href="#">Progress: {formatProgress(props.progress)}%</a>
              </li>
            </Show>
          </ul>
          <ul class="tags">
            <Show when={Date.now() - props.dateAdded < WEEK_MS}>
              <li class="new">
                <a href="#">new!</a>
              </li>
            </Show>
            <For each={props.genres}>
              {(tag) => (
                <li>
                  <a href="#">{tag}</a>
                </li>
              )}
            </For>
          </ul>
          <button class="favorite">
            <i class={props.favorite ? "icon-bookmark-on" : "icon-bookmark-off"} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default Book
