import "./Results.css"
import { state } from "../../state/state.ts"
import { Show } from "solid-js"

function Results() {
  return (
    <Show when={state.prompt.done}>
      <section class="results">{state.prompt.wpm} WPM</section>
    </Show>
  )
}

export default Results
