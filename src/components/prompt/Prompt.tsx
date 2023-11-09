import "./Prompt.css"
import { state } from "../../state/state.ts"

function Prompt() {
  return (
    <section class="prompt">
      <textarea class="task" disabled>
        {state.prompt.text}
      </textarea>
      <textarea class="input" spellcheck={false} autocomplete="off"></textarea>
      <textarea class="warning" disabled></textarea>
      <textarea class="error" disabled></textarea>
    </section>
  )
}

export default Prompt
