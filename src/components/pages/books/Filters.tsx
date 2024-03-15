import "./Filters.css"
import { Component } from "solid-js"
import state from "../../../state/state"

function setSearch(
  e: InputEvent & {
    currentTarget: HTMLInputElement
    target: HTMLInputElement
  },
) {
  console.log(e.target.value)
  state.set("session", "search", (e.target.value ?? "").toLowerCase().trim())
}

const Filters: Component = () => {
  return (
    <section class="filters">
      <label>
        Search:{" "}
        <input
          type="text"
          placeholder="title, author or genre"
          onInput={setSearch}
          value={state.get.session.search}
        />
      </label>
    </section>
  )
}

export default Filters
