import "./Prompt.css"
import { useParams } from "@solidjs/router"
import {
  createEffect,
  createMemo,
  For,
  Show,
  onMount,
  onCleanup,
  createResource,
} from "solid-js"
import { createStore } from "solid-js/store"

import config from "../../../config.ts"
import state from "../../../state/state.ts"
import { formatNum, formatPercentage } from "../../../utils/formatters.ts"
import { EXTRA_KEYS } from "./prompt-util/EXTRA_KEYS.ts"
import { getCharset } from "../../../libs/charsets.ts"
import { calculateAccuracy } from "./prompt-util/calculateAccuracy.tsx"
import { calculateWpm } from "./prompt-util/calculateWpm.tsx"
import { calculateParagraphWpm } from "./prompt-util/calculateParagraphWpm.tsx"
import { scrollToWord } from "./prompt-util/scrollToWord.tsx"
import { getPromptData } from "./prompt-actions/getPromptData.tsx"
import type { LocalState, WordStats, ParagraphStats } from "./types.ts"

import Statusbar from "./Statusbar.tsx"
import { calculateParagraphConsistency } from "./prompt-util/calculateParagraphConsistency.tsx"

function Prompt() {
  const params = useParams()

  const [local, setLocal] = createStore<LocalState>({
    hideCursor: false,
    done: false,
    paused: true,
    original: [],
    typed: [],
    stats: [],
    pageStats: { acc: null, wpm: null, inputTimes: [] },
    paragraphNum: 0,
    wordNum: 0,
    charNum: 0,
  })

  let afkTimeout: NodeJS.Timeout | null = null
  let charset = getCharset("en")

  const [promptData] = createResource(params.id, getPromptData)

  // Load prompt content on content change
  createEffect(() => {
    if (promptData() === undefined || promptData.loading || promptData.error) {
      return
    }

    charset = getCharset(promptData()!.bookInfo.language ?? "??")

    const original = (promptData()?.paragraphs ?? []).map((paragraph) =>
      paragraph
        .split(" ")
        .map((word, i, words) => [
          ...(word + (i === words.length - 1 ? "" : " ")),
        ]),
    )

    const empty = original.map((paragraph) =>
      paragraph.map((word) => word.map((_) => null)),
    )

    const stats = Array.from(
      { length: empty.length },
      (_, i) =>
        ({
          charCount: original[i].flat().length,
          correctCharCount: 0,
          wordCount: original[i].length,
          wpm: null,
          acc: null,
          consistency: null,
          inputTimes: [],
          startTime: 0,
          endTime: 0,
          totalTime: 0,
          typos: 0,
          nonTypos: 0,
          words: original[i].map(
            (chars) =>
              ({
                length: chars.length,
                typedLength: 0,
                times: [],
                isCorrect: false,
                hadTypos: false,
              }) as WordStats,
          ),
        }) as ParagraphStats,
    )

    setLocal("original", original)
    setLocal("typed", empty)
    setLocal("stats", stats)
    setLocal("paragraphNum", 0)
    setLocal("wordNum", 0)
    setLocal("charNum", 0)
  })

  // Update page live accuracy
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

  // Update page live wpm
  createEffect((prev) => {
    const label = `${local.paragraphNum}${local.wordNum}`

    if (label !== prev || local.done) {
      let totalTime = 0
      let totalCorrectCharsCount = 0
      let prevEndTime = 0

      for (const [paragraphNum, paragraphStats] of local.stats.entries()) {
        if (
          paragraphNum === local.paragraphNum &&
          paragraphStats.inputTimes.length > 1
        ) {
          const paragraphWpm = calculateParagraphWpm(
            paragraphStats.inputTimes,
            paragraphStats.words,
          )

          totalTime += paragraphWpm.time
          totalCorrectCharsCount += paragraphWpm.charsCount

          if (paragraphNum !== 0) {
            const timeBetweenParagraphs = paragraphWpm.start - prevEndTime
            totalTime +=
              timeBetweenParagraphs >= config.AFK_BOUNDRY
                ? config.AFK_PENALTY
                : timeBetweenParagraphs
          }
        }

        if (paragraphNum === local.paragraphNum) {
          break
        }

        totalTime += paragraphStats.totalTime
        totalCorrectCharsCount += paragraphStats.correctCharCount

        if (paragraphNum !== 0) {
          const timeBetweenParagraphs = paragraphStats.startTime - prevEndTime
          totalTime +=
            timeBetweenParagraphs >= config.AFK_BOUNDRY
              ? config.AFK_PENALTY
              : timeBetweenParagraphs
        }

        prevEndTime = paragraphStats.endTime
      }

      const wpm = calculateWpm(totalTime, totalCorrectCharsCount)

      if (!Number.isNaN(wpm)) {
        setLocal("pageStats", "wpm", wpm)
      }

      return label
    }

    return prev
  }, "0:0")

  // Add times chunk when the cursor enters or reenters word,
  // this way times of initial typin and later reentries (if user backspace from next word) are separate
  // and total time spent on a word can be calculated
  createEffect(() => {
    if (local.original.length > 0) {
      setLocal(
        "stats",
        local.paragraphNum,
        "words",
        local.wordNum,
        "times",
        (prev) => [...prev, []],
      )
    }
  })

  const handleTyping = (e: KeyboardEvent) => {
    if (
      e.key !== "Backspace" &&
      (EXTRA_KEYS.has(e.key) || e.metaKey || e.ctrlKey)
    ) {
      return
    }

    e.preventDefault()

    if (e.key === "Tab") {
      // Reset current paragraph
      setLocal("typed", local.paragraphNum, (prev) =>
        prev.map((word) => new Array(word.length).fill(null)),
      )
      setLocal("stats", local.paragraphNum, (prev) => {
        return {
          ...prev,
          wpm: null,
          acc: null,
          inputTimes: [],
          typos: 0,
          nonTypos: 0,
          words: local.original[local.paragraphNum].map((chars) => ({
            length: chars.length,
            typedLength: 0,
            times: [[]],
            isCorrect: false,
            hadTypos: false,
          })),
        }
      })
      // At the end so stats are recalculated correctly
      setLocal("wordNum", 0)
      setLocal("charNum", 0)

      return
    }

    if (e.key === "Backspace") {
      const isFirstParagraph = local.paragraphNum === 0
      const isFirstWord = local.wordNum === 0
      const isFirstChar = local.charNum === 0

      if (isFirstParagraph && isFirstWord && isFirstChar) {
        return
      }

      if (
        (e.ctrlKey && !state.get.settings.backspaceWholeWord) ||
        (!e.ctrlKey && state.get.settings.backspaceWholeWord)
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

    let char

    if (e.key === "Enter") {
      // Treat enter as line end if at the end of a paragraph,space otherwise
      // (to prevent annoying typo when the paragraph wraps and user don't realize space is required).
      char = expectedChar === "⏎" ? "⏎" : " "
    } else {
      // If the expected character is not in the current charset, accept any key
      char = charset.has(expectedChar) ? e.key : expectedChar
    }

    const inputTime = performance.now()

    setLocal("pageStats", "inputTimes", (prev) => [...prev, inputTime])
    setLocal("stats", local.paragraphNum, "inputTimes", (prev) => [
      ...prev,
      inputTime,
    ])
    setLocal(
      "stats",
      local.paragraphNum,
      "words",
      local.wordNum,
      "times",
      local.stats[local.paragraphNum].words[local.wordNum].times.length - 1,
      (prev) => [...prev, inputTime],
    )

    if (char !== expectedChar) {
      setLocal("stats", local.paragraphNum, "typos", (prev) => prev + 1)
      setLocal(
        "stats",
        local.paragraphNum,
        "words",
        local.wordNum,
        "hadTypos",
        true,
      )
    } else if (char !== "⏎") {
      setLocal("stats", local.paragraphNum, "nonTypos", (prev) => prev + 1)
    }

    setLocal("typed", local.paragraphNum, local.wordNum, local.charNum, char)
    setLocal(
      "stats",
      local.paragraphNum,
      "words",
      local.wordNum,
      "typedLength",
      local.charNum + 1,
    )
    setLocal("paused", false)
    setLocal("hideCursor", true)

    if (afkTimeout !== null) {
      clearTimeout(afkTimeout)
    }

    afkTimeout = setTimeout(() => {
      setLocal("paused", true)
    }, config.AFK_BOUNDRY)

    // Mark if partial (or full) word is correct
    setLocal(
      "stats",
      local.paragraphNum,
      "words",
      local.wordNum,
      "isCorrect",
      local.original[local.paragraphNum][local.wordNum]
        .join("")
        .startsWith(local.typed[local.paragraphNum][local.wordNum].join("")),
    )

    // PARAGRAPH END
    if (expectedChar === "⏎") {
      setLocal("paused", true)
      const acc = calculateAccuracy(
        local.stats[local.paragraphNum].nonTypos,
        local.stats[local.paragraphNum].typos,
      )
      const { wpm, start, end, time, charsCount } = calculateParagraphWpm(
        local.stats[local.paragraphNum].inputTimes,
        local.stats[local.paragraphNum].words,
        local.stats[local.paragraphNum].totalTime,
      )

      const consistency = calculateParagraphConsistency(
        local.stats[local.paragraphNum].inputTimes,
        local.stats[local.paragraphNum].charCount,
        local.stats[local.paragraphNum].consistency,
      )

      console.log({ consistency: formatPercentage(consistency) })

      setLocal("stats", local.paragraphNum, "acc", acc)
      setLocal("stats", local.paragraphNum, "wpm", wpm)
      setLocal("stats", local.paragraphNum, "consistency", consistency)
      setLocal("stats", local.paragraphNum, "startTime", start)
      setLocal("stats", local.paragraphNum, "endTime", end)
      setLocal("stats", local.paragraphNum, "totalTime", time)
      setLocal("stats", local.paragraphNum, "correctCharCount", charsCount)

      // save paragraph stats
    }

    const isLastChar =
      local.charNum ===
      local.original[local.paragraphNum][local.wordNum].length - 1
    const isLastWord =
      isLastChar && local.wordNum === local.typed[local.paragraphNum].length - 1
    const isLastParagraph =
      isLastWord && local.paragraphNum === local.typed.length - 1

    if (isLastParagraph) {
      console.log("Page done!")
      setLocal("done", true)

      // Remove when there is summary page or next page mechanism
      setLocal("charNum", local.charNum + 1)

      console.log(local)
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

    window.addEventListener("mousemove", () => setLocal("hideCursor", false))
  })

  onCleanup(() => {
    window.removeEventListener("keydown", handleTyping)

    if (afkTimeout !== null) {
      clearTimeout(afkTimeout)
    }
  })

  // Scroll lines automatically
  createEffect((prev: number) => {
    // Needed only for the effect to trigger on changes to these props
    if (local.paragraphNum < 0 || local.wordNum < 0) {
      return prev
    }

    return scrollToWord(prev)
  }, 0)

  let screenKeyboardPrompt: HTMLInputElement | undefined

  return (
    <>
      <Show when={promptData()}>
        <Statusbar
          bookId={promptData()!.bookInfo.id}
          bookTitle={promptData()!.bookInfo.title}
          chapterTitle={promptData()!.chapterInfo?.title ?? ""}
          wpm={local.pageStats.wpm}
          acc={local.pageStats.acc}
          paused={local.paused}
          page={1}
          pages={200}
        />
        <section
          classList={{
            prompt: true,
            nocursor: local.hideCursor,
            "caret-line": state.get.settings.caret === "line",
            "caret-block": state.get.settings.caret === "block",
            "caret-floor": state.get.settings.caret === "floor",
          }}
          onClick={() => {
            if (screenKeyboardPrompt) {
              screenKeyboardPrompt.focus()
              if (config.IS_MOBILE && window.visualViewport) {
                window.visualViewport?.addEventListener(
                  "resize",
                  () => {
                    scrollToWord()
                  },
                  { once: true },
                )
              } else {
                scrollToWord()
              }
            }
          }}
        >
          <input type="text" ref={screenKeyboardPrompt!} />
          <div class="paragraphs">
            <For each={local.original}>
              {(paragraph, paragraphNum) => {
                const wpm = createMemo(() => {
                  const val = local.stats?.[paragraphNum()]?.wpm
                  return val !== null && val !== undefined
                    ? `${formatNum(val)} wpm`
                    : ""
                })

                const acc = createMemo(() => {
                  const val = local.stats?.[paragraphNum()]?.acc
                  return val !== null && val !== undefined
                    ? `${formatPercentage(val)} acc`
                    : ""
                })

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
                                          paragraphNum() ===
                                            local.paragraphNum &&
                                          wordNum() === local.wordNum &&
                                          charNum() === local.charNum,
                                        ok: isCorrect(),
                                        error:
                                          currentChar() !== null &&
                                          !isCorrect(),
                                        special: letter === "⏎",
                                      }}
                                    >
                                      {state.get.settings.showTypos
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
      </Show>
    </>
  )
}

export default Prompt
