import "./Prompt.css"
import state from "../../state/state.ts"
import { createSignal, createEffect, For, onMount, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { EXTRA_KEYS } from "./EXTRA_KEYS.ts"
import { Bag } from "../../utils/Bag.ts"

const missedWords = new Bag()
console.log(missedWords)

function cleanWord(word: string[]) {
  return word.join("").trim().toLowerCase()
}

type ParagraphStats = {
  wpm: null | number
  acc: null | number
  typos: number
  start: null | number
  time: null | number
}

type Typed = {
  typed: (string | null)[][][]
  stats: ParagraphStats[]
  paragraphNum: number
  wordNum: number
  charNum: number
}

function Prompt() {
  const [originalWords, setOriginalWords] = createSignal([[]] as string[][][])

  const [local, setLocal] = createStore({
    typed: [],
    stats: [],
    paragraphNum: 0,
    wordNum: 0,
    charNum: 0,
  } as Typed)

  // Load prompt content on content change
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

    const stats = Array.from({ length: empty.length }, (_) => ({
      wpm: null,
      acc: null,
      typos: 0,
      start: null,
      time: null,
    }))

    setOriginalWords(original)
    setLocal("typed", empty)
    setLocal("stats", stats)
    setLocal("paragraphNum", 0)
    setLocal("wordNum", 0)
    setLocal("charNum", 0)
  })

  createEffect((prev) => {
    if (local.paragraphNum !== prev) {
      console.log("Paragraph typed:", local.paragraphNum)
      return local.paragraphNum
    }

    return prev
  }, 0)

  const handleTyping = (e: KeyboardEvent) => {
    if (
      e.key !== "Backspace" &&
      (EXTRA_KEYS.has(e.key) || e.metaKey || e.ctrlKey)
    ) {
      return
    }

    e.preventDefault()

    if (e.key === "Backspace") {
      const isFirstParagraph = local.paragraphNum === 0
      const isFirstWord = local.wordNum === 0
      const isFirstChar = local.charNum === 0

      if (isFirstParagraph && isFirstWord && isFirstChar) {
        return
      }

      if (
        (e.ctrlKey && !state.get.options.backspaceWholeWord) ||
        (!e.ctrlKey && state.get.options.backspaceWholeWord)
      ) {
        // Delete whole word
        if (isFirstWord && isFirstChar) {
          setLocal("paragraphNum", local.paragraphNum - 1)
          setLocal("wordNum", local.typed[local.paragraphNum].length - 1)
          setLocal("charNum", 0)
        } else if (isFirstChar) {
          setLocal("wordNum", local.wordNum - 1)
          setLocal("charNum", 0)
        } else {
          setLocal("charNum", 0)
        }

        setLocal("typed", local.paragraphNum, local.wordNum, (prev) =>
          [...prev].fill(null),
        )
      } else {
        // Delete single character
        if (isFirstWord && isFirstChar) {
          setLocal("paragraphNum", local.paragraphNum - 1)
          setLocal("wordNum", local.typed[local.paragraphNum].length - 1)
          setLocal(
            "charNum",
            local.typed[local.paragraphNum][local.wordNum].length - 1,
          )
        } else if (isFirstChar) {
          setLocal("wordNum", local.wordNum - 1)
          setLocal(
            "charNum",
            local.typed[local.paragraphNum][local.wordNum].length - 1,
          )
        } else {
          setLocal("charNum", local.charNum - 1)
        }

        setLocal(
          "typed",
          local.paragraphNum,
          local.wordNum,
          local.charNum,
          null,
        )
      }

      return
    }

    const expectedChar =
      originalWords()[local.paragraphNum][local.wordNum][local.charNum]

    if (expectedChar === "⏎" && e.key !== "Enter") {
      // TODO indicate that the user has to press enter to end the paragraph
      return
    }

    const char =
      e.key === "Enter"
        ? "⏎"
        : // If the expected character is not in the current charset, accept any key
          state.get.charset.has(expectedChar)
          ? e.key
          : expectedChar

    if (char !== expectedChar) {
      setLocal("stats", local.paragraphNum, "typos", (prev) => prev + 1)
      const mistypedWord = cleanWord(
        originalWords()[local.paragraphNum][local.wordNum],
      )

      console.log(local.stats[local.paragraphNum].typos, mistypedWord)
    }

    setLocal("typed", local.paragraphNum, local.wordNum, local.charNum, char)

    const isLastChar =
      local.charNum ===
      originalWords()[local.paragraphNum][local.wordNum].length - 1

    const isLastWord =
      isLastChar && local.wordNum === local.typed[local.paragraphNum].length - 1

    const isLastParagraph =
      isLastWord && local.paragraphNum === local.typed.length - 1

    if (isLastParagraph) {
      console.log("Page done!")
    } else if (isLastWord) {
      setLocal("charNum", 0)
      setLocal("wordNum", 0)
      setLocal("paragraphNum", local.paragraphNum + 1)
    } else if (isLastChar) {
      setLocal("charNum", 0)
      setLocal("wordNum", local.wordNum + 1)
    } else {
      setLocal("charNum", local.charNum + 1)
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
    if (local.paragraphNum < 0 || local.wordNum < 0) {
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
    <section
      classList={{
        prompt: true,
        "caret-line": state.get.options.caret === "line",
        "caret-block": state.get.options.caret === "block",
        "caret-floor": state.get.options.caret === "floor",
      }}
    >
      <div class="console">
        Paragraph: {local.paragraphNum} | Word: {local.wordNum} | Char:{" "}
        {local.charNum} | WPM: 0 | ACC: 0
      </div>
      <div class="paragraphs">
        <For each={originalWords()}>
          {(paragraph, paragraphNum) => {
            const wpm = () => {
              const val = local.stats?.[paragraphNum()]?.wpm
              return val !== null && val !== undefined ? `${val} wpm` : ""
            }

            const acc = () => {
              const val = local.stats?.[paragraphNum()]?.acc
              return val !== null && val !== undefined ? `${val}% acc` : ""
            }

            return (
              <p data-wpm={wpm()} data-acc={acc()}>
                <For each={paragraph}>
                  {(word, wordNum) => {
                    const currentWord = () =>
                      local.typed[paragraphNum()][wordNum()]
                    const expectedWord = () =>
                      originalWords()[paragraphNum()][wordNum()]
                    const isInaccurate = () =>
                      !currentWord().includes(null) &&
                      currentWord().join("") !== expectedWord().join("")

                    const isActive = () =>
                      paragraphNum() === local.paragraphNum &&
                      wordNum() === local.wordNum

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
                                local.typed[paragraphNum()][wordNum()][
                                  charNum()
                                ]

                              const expectedChar = () =>
                                originalWords()[paragraphNum()][wordNum()][
                                  charNum()
                                ]

                              const isCorrect = () =>
                                currentChar() === expectedChar()

                              const getTypedChar = () => {
                                let typedChar =
                                  local.typed[paragraphNum()][wordNum()][
                                    charNum()
                                  ]

                                if (typedChar === " " && letter !== " ") {
                                  typedChar = "_" // "␣"
                                }

                                return typedChar ?? letter
                              }

                              return (
                                <span
                                  classList={{
                                    letter: true,
                                    caret:
                                      paragraphNum() === local.paragraphNum &&
                                      wordNum() === local.wordNum &&
                                      charNum() === local.charNum,
                                    ok: isCorrect(),
                                    error:
                                      currentChar() !== null && !isCorrect(),
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
            )
          }}
        </For>
      </div>
    </section>
  )
}

export default Prompt
