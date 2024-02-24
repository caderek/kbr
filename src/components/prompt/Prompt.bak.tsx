import "./Prompt.css"
import state from "../../state/state.ts"
import { createSignal, createEffect, For } from "solid-js"
import {
  addStrokeToText,
  getLetterStyles,
  getStroke,
} from "./prompt-helpers.ts"
import { zip } from "../../utils/array.ts"

function Prompt() {
  let started = false
  let times: number[] = []
  let strokes: string[] = []
  let prompt = ""
  let input = ""
  let caret = 0

  const [chars, setChars] = createSignal<[string, string][]>([])

  createEffect(() => {
    started = false
    times = []
    strokes = []
    prompt = state.get.prompt.paragraphs
    input = ""
    caret = 0
    setChars(state.get.prompt.text.split("").map((char) => [char, ""]))
  })

  return (
    <section class="prompt">
      <div class="letter-display">
        <For each={chars()}>
          {([char, style], index) => (
            <span classList={{ [style]: true, caret: index() === caret }}>
              {char}
            </span>
          )}
        </For>
      </div>
      <textarea
        class="input"
        autofocus
        spellcheck={false}
        onInput={(e) => {
          if (!started) {
            started = true
          }

          const text = e.target.value
          times.push(Date.now())

          const stroke = getStroke(e)
          input = addStrokeToText(input, stroke)
          const styles = getLetterStyles(state.get.prompt.text, input)
          caret = input.length
          setChars(zip([...prompt], styles))

          if (text.length === prompt.length) {
            const timePerChar = (times.at(-1) - times.at(0)) / prompt.length
            const cpm = Math.round((60 * 1000) / timePerChar)
            const wpm = Math.round(cpm / 5)
            console.log({ cpm, wpm })
            console.log(strokes)

            state.set("prompt", "done", true)
            state.set("prompt", "wpm", wpm)
          }
        }}
        autocomplete="off"
      ></textarea>
    </section>
  )
}

export default Prompt
