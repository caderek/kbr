import "./Results.css"
import state from "../../state/state.ts"
import { Show } from "solid-js"

function Results() {
  return (
    <Show when={state.get.prompt.done}>
      <section class="results">{state.get.prompt.wpm} WPM</section>
    </Show>
  )
}

export default Results
