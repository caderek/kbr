import "./Prompt.css"
import state from "../../state/state.ts"
import { createEffect, For, onMount, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { EXTRA_KEYS } from "./EXTRA_KEYS.ts"
import { Bag } from "../../utils/Bag.ts"

const missedWords = new Bag()
console.log(missedWords)

function cleanWord(word: string[]) {
  return word.join("").trim().toLowerCase().replace(/⏎$/, "")
}

function calculateAccuracy(nonTypos: number, typos: number) {
  return nonTypos / (typos + nonTypos)
}

function formatPercentage(num: number, precision: number = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(num)
}

type ParagraphStats = {
  charCount: number
  wordCount: number
  wpm: null | number
  acc: null | number
  typos: number
  nonTypos: number
  start: null | number
  time: null | number
}

type PageStats = {
  wpm: null | number
  acc: null | number
}

type Typed = {
  typed: (string | null)[][][]
  original: string[][][]
  stats: ParagraphStats[]
  pageStats: PageStats
  paragraphNum: number
  wordNum: number
  charNum: number
}

function Prompt() {
  const [local, setLocal] = createStore({
    original: [],
    typed: [],
    stats: [],
    pageStats: { acc: null, wpm: null },
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

    const stats = Array.from({ length: empty.length }, (_, i) => ({
      charCount: original[i].flat().length,
      wordCount: original[i].length,
      wpm: null,
      acc: null,
      typos: 0,
      nonTypos: 0,
      start: null,
      time: null,
    }))

    setLocal("original", original)
    setLocal("typed", empty)
    setLocal("stats", stats)
    setLocal("paragraphNum", 0)
    setLocal("wordNum", 0)
    setLocal("charNum", 0)
  })

  // Update page stats when paragraph stats change
  createEffect(() => {
    if (local.stats.length === 0) {
      return
    }

    const { nonTypos, typos } = local.stats.reduce(
      (sums, parStats) => {
        sums.nonTypos += parStats.nonTypos
        sums.typos += parStats.typos
        return sums
      },
      { nonTypos: 0, typos: 0 },
    )

    if (nonTypos > 0 || typos > 0) {
      setLocal("pageStats", "acc", calculateAccuracy(nonTypos, typos))
    }
  })

  // createEffect((prev) => {
  //   if (local.paragraphNum !== prev) {
  //     console.log("Paragraph typed:", local.paragraphNum)
  //     return local.paragraphNum
  //   }
  //
  //   return prev
  // }, 0)

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
      local.original[local.paragraphNum][local.wordNum][local.charNum]

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
        local.original[local.paragraphNum][local.wordNum],
      )

      console.log(local.stats[local.paragraphNum].typos, mistypedWord)
    } else if (char !== "⏎") {
      setLocal("stats", local.paragraphNum, "nonTypos", (prev) => prev + 1)
    }

    if (expectedChar === "⏎") {
      console.log(`Pargraph ${local.paragraphNum} done!`)

      const acc = calculateAccuracy(
        local.stats[local.paragraphNum].nonTypos,
        local.stats[local.paragraphNum].typos,
      )

      setLocal("stats", local.paragraphNum, "acc", acc)
    }

    setLocal("typed", local.paragraphNum, local.wordNum, local.charNum, char)

    const isLastChar =
      local.charNum ===
      local.original[local.paragraphNum][local.wordNum].length - 1

    const isLastWord =
      isLastChar && local.wordNum === local.typed[local.paragraphNum].length - 1

    const isLastParagraph =
      isLastWord && local.paragraphNum === local.typed.length - 1

    if (isLastParagraph) {
      console.log("Page done!")
      setLocal("charNum", local.charNum + 1)
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

  const liveAcc = () =>
    local.pageStats.acc !== null
      ? formatPercentage(local.pageStats.acc, 1)
      : "-"

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
        {local.charNum} | WPM: 0 | ACC: {liveAcc()}
      </div>
      <div class="paragraphs">
        <For each={local.original}>
          {(paragraph, paragraphNum) => {
            const wpm = () => {
              const val = local.stats?.[paragraphNum()]?.wpm
              return val !== null && val !== undefined ? `${val} wpm` : ""
            }

            const acc = () => {
              const val = local.stats?.[paragraphNum()]?.acc
              return val !== null && val !== undefined
                ? `${formatPercentage(val)} acc`
                : ""
            }

            return (
              <p data-wpm={wpm()} data-acc={acc()}>
                <For each={paragraph}>
                  {(word, wordNum) => {
                    const currentWord = () =>
                      local.typed[paragraphNum()][wordNum()]
                    const expectedWord = () =>
                      local.original[paragraphNum()][wordNum()]
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
                                local.original[paragraphNum()][wordNum()][
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
