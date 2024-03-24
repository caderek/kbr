import "./Book.css"
import { Component, Show, For } from "solid-js"
import Cover from "./Cover"
import { formatPercentageNice } from "../../../utils/formatters"
import { toggleFavorite } from "../../../actions/toggleFavorite"

const WEEK_MS = 1000 * 60 * 60 * 24 * 7

type Props = {
  coverUrl: string
  id: string
  title: string
  author: string
  description: string
  pages: number
  progress: number
  favorite: boolean
  dateAdded: number
  genres: string[]
}

const Book: Component<Props> = (props) => {
  return (
    <article class="book" style={`--pages: ${props.pages}`}>
      <Cover url={props.coverUrl} />
      <div class="scroll-box">
        <div class="info">
          <h3>
            <a href={"/books/" + props.id}>{props.title}</a>
          </h3>
          <p class="author">
            by <a href="#">{props.author}</a>
          </p>
          <p class="description" title={props.description}>
            {props.description}
          </p>
          <ul class="stats">
            <li>
              <span>
                {props.pages} page{props.pages !== 1 ? "s" : ""}
              </span>
            </li>
            <Show when={props.progress === 1}>
              <li class="done">
                <a href="#">Done!</a>
              </li>
            </Show>
            <Show when={props.progress > 0 && props.progress < 1}>
              <li class="in-progress" title="Show all in progress">
                <a href="#">{formatPercentageNice(props.progress)}% done</a>
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
          <button
            classList={{ favorite: true, active: props.favorite }}
            onClick={() => toggleFavorite(props.id)}
          >
            <i
              class={props.favorite ? "icon-bookmark-on" : "icon-bookmark-off"}
            />
          </button>
        </div>
      </div>
    </article>
  )
}

export default Book
