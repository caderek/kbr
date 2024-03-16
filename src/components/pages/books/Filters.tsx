import "./Filters.css"
import { Component, createMemo } from "solid-js"
import state from "../../../state/state"
import { SortBy } from "../../../types/common"
import { debounce } from "../../../utils/debounce"

const setSearch = debounce(
  (
    e: InputEvent & {
      target: HTMLInputElement
    },
  ) => {
    const phrase = (e.target.value ?? "").toLowerCase().trim()
    state.set("session", "search", phrase)
    state.set("session", "booksPage", 1)
  },
  300,
)

function setOrderBy(
  e: Event & {
    target: HTMLSelectElement
  },
) {
  state.set("settings", "sortBy", e.target.value as SortBy)
  state.set("session", "booksPage", 1)
}

const Filters: Component = () => {
  const current = createMemo(() => state.get.settings.sortBy)

  return (
    <section class="filters">
      <label>
        <span>Sort by </span>
        <select onChange={setOrderBy}>
          <option value="author" selected={current() === "author"}>
            Author
          </option>
          <option value="title" selected={current() === "title"}>
            Title
          </option>
          <option value="length" selected={current() === "length"}>
            Length
          </option>
          {/* <option value="year" selected={current() === "year"}> */}
          {/*   Year */}
          {/* </option> */}
          <option value="added" selected={current() === "added"}>
            Date added
          </option>
        </select>
      </label>
      <label>
        <span>Search </span>
        <input
          type="text"
          placeholder="Title, author or genre..."
          onInput={setSearch}
          value={state.get.session.search}
        />
      </label>
    </section>
  )
}

export default Filters
