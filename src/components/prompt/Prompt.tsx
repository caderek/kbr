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
import { argv0 } from "process"
import { preview } from "vite"

type Typed = {
  words: (string | null)[][][]
  paragraphNum: number
  wordNum: number
  charNum: number
}

const EXTRA_KEYS = new Set([
  "Escape",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "Insert",
  "Delete",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "NumLock",
  "Control",
  "Alt",
  "AltGraph",
  "Shift",
  "CapsLock",
  "Meta",
])

function Prompt() {
  const [originalWords, setOriginalWords] = createSignal([[]] as string[][][])

  const [typed, setTyped] = createStore({
    words: [],
    paragraphNum: 0,
    wordNum: 0,
    charNum: 0,
  } as Typed)

  createEffect(() => {
    const original = state.get.prompt.paragraphs.map((paragraph) =>
      paragraph
        .split(" ")
        .map((word, i, words) => [
          ...(word + (i === words.length - 1 ? "" : " ")),
        ]),
    )

    const empty = original.map((paragraph) =>
      paragraph.map((word) => word.map((_) => null)),
    )

    setOriginalWords(original)
    setTyped("words", empty)
    setTyped("paragraphNum", 0)
    setTyped("wordNum", 0)
    setTyped("charNum", 0)
  })

  const handleTyping = (e: KeyboardEvent) => {
    if (
      e.key !== "Backspace" &&
      (EXTRA_KEYS.has(e.key) || e.metaKey || e.ctrlKey)
    ) {
      return
    }

    e.preventDefault()

    if (e.key === "Backspace") {
      const isFirstParagraph = typed.paragraphNum === 0
      const isFirstWord = typed.wordNum === 0
      const isFirstChar = typed.charNum === 0

      if (isFirstParagraph && isFirstWord && isFirstChar) {
        return
      }

      if (
        (e.ctrlKey && !state.get.options.backspaceWholeWord) ||
        (!e.ctrlKey && state.get.options.backspaceWholeWord)
      ) {
        // Delete whole word
        if (isFirstWord && isFirstChar) {
          setTyped("paragraphNum", typed.paragraphNum - 1)
          setTyped("wordNum", typed.words[typed.paragraphNum].length - 1)
          setTyped("charNum", 0)
        } else if (isFirstChar) {
          setTyped("wordNum", typed.wordNum - 1)
          setTyped("charNum", 0)
        } else {
          setTyped("charNum", 0)
        }

        setTyped("words", typed.paragraphNum, typed.wordNum, (prev) =>
          [...prev].fill(null),
        )
      } else {
        // Delete single character
        if (isFirstWord && isFirstChar) {
          setTyped("paragraphNum", typed.paragraphNum - 1)
          setTyped("wordNum", typed.words[typed.paragraphNum].length - 1)
          setTyped(
            "charNum",
            typed.words[typed.paragraphNum][typed.wordNum].length - 1,
          )
        } else if (isFirstChar) {
          setTyped("wordNum", typed.wordNum - 1)
          setTyped(
            "charNum",
            typed.words[typed.paragraphNum][typed.wordNum].length - 1,
          )
        } else {
          setTyped("charNum", typed.charNum - 1)
        }

        setTyped(
          "words",
          typed.paragraphNum,
          typed.wordNum,
          typed.charNum,
          null,
        )
      }

      return
    }

    const expectedChar =
      originalWords()[typed.paragraphNum][typed.wordNum][typed.charNum]

    if (expectedChar === "⏎" && e.key !== "Enter") {
      // TODO indicate that the user has to press enter to end the paragraph
      return
    }

    // If the expected character is not in the current charset, accept any key
    const char = state.get.charset.has(expectedChar) ? e.key : expectedChar

    setTyped("words", typed.paragraphNum, typed.wordNum, typed.charNum, char)

    const isLastChar =
      typed.charNum ===
      originalWords()[typed.paragraphNum][typed.wordNum].length - 1

    const isLastWord =
      isLastChar && typed.wordNum === typed.words[typed.paragraphNum].length - 1

    const isLastParagraph =
      isLastWord && typed.paragraphNum === typed.words.length - 1

    if (isLastParagraph) {
      console.log("Page done!")
    } else if (isLastWord) {
      setTyped("charNum", 0)
      setTyped("wordNum", 0)
      setTyped("paragraphNum", typed.paragraphNum + 1)
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

  // Scroll lines automatically
  createEffect((prev) => {
    // Needed only for the effect to trigger on changes to these props
    if (typed.paragraphNum < 0 || typed.wordNum < 0) {
      return prev
    }

    const node = document.querySelector(".word.active") as HTMLSpanElement

    if (node) {
      const offset = window.scrollY + node.getBoundingClientRect().top

      if (offset !== prev) {
        node.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })

        return offset
      }
    }

    return prev
  }, 0)

  return (
    <section class="prompt">
      <div class="console">
        Paragraph: {typed.paragraphNum} | Word: {typed.wordNum} | Char:{" "}
        {typed.charNum}
      </div>
      <div class="paragraphs">
        <For each={originalWords()}>
          {(paragraph, paragraphNum) => (
            <p data-wpm="57 wpm" data-acc="98% acc">
              <For each={paragraph}>
                {(word, wordNum) => {
                  const currentWord = () =>
                    typed.words[paragraphNum()][wordNum()]
                  const expectedWord = () =>
                    originalWords()[paragraphNum()][wordNum()]
                  const isInaccurate = () =>
                    !currentWord().includes(null) &&
                    currentWord().join("") !== expectedWord().join("")

                  const isActive = () =>
                    paragraphNum() === typed.paragraphNum &&
                    wordNum() === typed.wordNum

                  return (
                    <span
                      classList={{
                        word: true,
                        inaccurate: isInaccurate(),
                        active: isActive(),
                      }}
                    >
                      {
                        <For each={word}>
                          {(letter, charNum) => {
                            const currentChar = () =>
                              typed.words[paragraphNum()][wordNum()][charNum()]

                            const expectedChar = () =>
                              originalWords()[paragraphNum()][wordNum()][
                                charNum()
                              ]

                            const isCorrect = () =>
                              currentChar() === expectedChar()

                            const getTypedChar = () => {
                              let typedChar =
                                typed.words[paragraphNum()][wordNum()][
                                  charNum()
                                ]

                              if (typedChar === " " && letter !== " ") {
                                typedChar = "␣"
                              }

                              return typedChar ?? letter
                            }

                            return (
                              <span
                                classList={{
                                  letter: true,
                                  caret:
                                    paragraphNum() === typed.paragraphNum &&
                                    wordNum() === typed.wordNum &&
                                    charNum() === typed.charNum,
                                  ok: isCorrect(),
                                  error: currentChar() !== null && !isCorrect(),
                                  special: letter === "⏎",
                                }}
                              >
                                {state.get.options.showTypos
                                  ? getTypedChar()
                                  : letter}
                              </span>
                            )
                          }}
                        </For>
                      }
                    </span>
                  )
                }}
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
// element.scrollIntoView({
//   behavior: "smooth",
//   block: "center",
// })
//     elements.forEach((el) => {
//       el.style.background = "transparent"
//     })
//     element.style.background = "#24283B"
//     j = (j + 1) % elements.length
//   }
// })

export default Prompt
