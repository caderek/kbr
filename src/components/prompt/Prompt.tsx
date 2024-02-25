import "./Prompt.css"
import state from "../../state/state.ts"
import { createSignal, createEffect, For, onMount, onCleanup } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import {
  addStrokeToText,
  getLetterStyles,
  getStroke,
} from "./prompt-helpers.ts"
import { zip } from "../../utils/array.ts"

type Typed = {
  chars: string[][]
  paragraphNum: number
  wordNum: number
  charNum: number
}

function Prompt() {
  const [originalWords, setOriginalWords] = createSignal([[]] as string[][])

  const [typed, setTyped] = createStore({
    chars: [[]],
    paragraphNum: 0,
    wordNum: 0,
    charNum: 0,
  } as Typed)

  createEffect(() => {
    setOriginalWords(
      state.get.prompt.paragraphs.map((paragraph) =>
        paragraph
          .split(" ")
          .map((word, i, words) => word + (i === words.length - 1 ? "" : " ")),
      ),
    )
  })

  const handleTyping = (e: KeyboardEvent) => {
    if (
      e.key === "ALt" ||
      e.key === "AltGraph" ||
      e.key === "Shift" ||
      e.key === "Control"
    ) {
      return
    }

    e.preventDefault()

    if (e.key === "Backspace") {
      if (e.ctrlKey || state.get.options.backspaceWholeWord) {
        if (typed.charNum === 0) {
          if (typed.wordNum === 0) {
            if (typed.paragraphNum === 0) {
              return
            }
            setTyped("chars", (prev) => prev.slice(0, -1))
            setTyped("paragraphNum", typed.paragraphNum - 1)
            setTyped(
              "wordNum",
              Math.max(typed.chars[typed.paragraphNum].length - 1, 0),
            )
          } else {
            setTyped("wordNum", typed.wordNum - 1)
          }

          setTyped("chars", typed.paragraphNum, (prev) => prev.slice(0, -1))
          setTyped("charNum", 0)
        } else {
          setTyped("chars", typed.paragraphNum, (prev) => prev.slice(0, -1))
          setTyped("charNum", 0)
        }
      } else {
        console.log("backspace single char")
      }

      return
    }

    const expectedChar =
      originalWords()[typed.paragraphNum][typed.wordNum][typed.charNum]

    const char = state.get.charset.has(expectedChar) ? e.key : expectedChar
    const word =
      ((typed.chars[typed.paragraphNum] ?? [])[typed.wordNum] ?? "") + char

    setTyped("chars", typed.paragraphNum, typed.wordNum, word)

    const isLastChar =
      word.length === originalWords()[typed.paragraphNum][typed.wordNum].length

    const isLastWord =
      isLastChar &&
      originalWords()[typed.paragraphNum].length ===
        typed.chars[typed.paragraphNum].length

    const isLastParagraph =
      isLastChar && isLastWord && originalWords().length === typed.chars.length

    if (isLastParagraph) {
      console.log("Page done!")
    } else if (isLastWord) {
      setTyped("charNum", 0)
      setTyped("wordNum", 0)
      setTyped("paragraphNum", typed.paragraphNum + 1)
      setTyped("chars", (prev) => prev.concat([[]]))
    } else if (isLastChar) {
      setTyped("charNum", 0)
      setTyped("wordNum", typed.wordNum + 1)
    } else {
      setTyped("charNum", typed.charNum + 1)
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleTyping)
  })

  onCleanup(() => {
    window.removeEventListener("keydown", handleTyping)
  })

  return (
    <section class="prompt">
      <div class="paragraphs">
        <For each={originalWords()}>
          {(paragraph, paragraphNum) => (
            <p data-wpm="57 wpm" data-acc="98% acc">
              <For each={paragraph}>
                {(word, wordNum) => (
                  <span class="word">
                    {
                      <For each={word.split("")}>
                        {(letter, charNum) => (
                          <span
                            classList={{
                              letter: true,
                              caret:
                                paragraphNum() === typed.paragraphNum &&
                                wordNum() === typed.wordNum &&
                                charNum() === typed.charNum,
                              ok:
                                originalWords()[0][0] !== undefined &&
                                typed.chars?.[paragraphNum()]?.[wordNum()]?.[
                                  charNum()
                                ] ===
                                  originalWords()?.[paragraphNum()]?.[
                                    wordNum()
                                  ]?.[charNum()],
                              special: letter === "⏎",
                            }}
                          >
                            {letter}
                          </span>
                        )}
                      </For>
                    }
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

// let j = 0
//
// window.addEventListener("keydown", (e) => {
//   if (e.key === " ") {
//     e.preventDefault()
//     const elements = document.querySelectorAll(".paragraphs .word")
//     const element = elements[j]
//
//     element.scrollIntoView({
//       behavior: "smooth",
//       block: "center",
//     })
//     elements.forEach((el) => {
//       el.style.background = "transparent"
//     })
//     element.style.background = "#24283B"
//     j = (j + 1) % elements.length
//   }
// })

export default Prompt
