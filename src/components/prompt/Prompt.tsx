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
  return (
    <section class="prompt">
      <div class="paragraphs">
        <For each={state.get.prompt.paragraphs}>
          {(paragraph, paragraphNum) => (
            <p data-wpm="57 WPM" data-acc="98% ACC">
              <For each={paragraph.split(" ")}>
                {(word, wordNum) => (
                  <span class="word">
                    {
                      <For each={word.split("")}>
                        {(letter, letterNum) => (
                          <span class="letter">{letter}</span>
                        )}
                      </For>
                    }{" "}
                  </span>
                )}
              </For>
            </p>
          )}
        </For>
      </div>
    </section>
  )
}

let i = 0
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    const elements = document.querySelectorAll(".paragraphs p")
    const element = elements[i]
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
    elements.forEach((el) => {
      el.style.borderLeft = "solid 8px transparent"
    })
    element.style.borderLeft = "solid 8px var(--color-bg-hc)"
    i = (i + 1) % elements.length
  }
})

export default Prompt
