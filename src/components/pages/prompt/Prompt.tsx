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
  on,
} from "solid-js"
import { createStore } from "solid-js/store"

import config from "../../../config.ts"
import state from "../../../state/state.ts"
import { formatNum, formatPercentage } from "../../../utils/formatters.ts"
import { EXTRA_KEYS } from "./prompt-util/EXTRA_KEYS.ts"
import { scrollToWord } from "./prompt-util/scrollToWord.ts"
import { getPromptData } from "./prompt-actions/getPromptData.ts"
import type { LocalState } from "./types.ts"

import Statusbar from "./Statusbar.tsx"
import { handleBackspace } from "./prompt-actions/handleBackspace.ts"
import { handleParagraphReset } from "./prompt-actions/handleParagraphReset.ts"
import { updateAverageAccuracy } from "./prompt-actions/updateAverageAccuracy.ts"
import { updateAverageWpm } from "./prompt-actions/updateAverageWpm.ts"
import { handleStandardInput } from "./prompt-actions/handleStandardInput.ts"
import { loadPromptContent } from "./prompt-actions/loadPromptContent.ts"

function Prompt() {
  const params = useParams()

  const [local, setLocal] = createStore<LocalState>({
    id: null,
    charset: new Set(),
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

  const [promptData] = createResource(params.id, getPromptData)

  const wordLabel = createMemo(() => {
    return `${local.paragraphNum}:${local.wordNum}`
  })

  createEffect(
    on(promptData, () => loadPromptContent(promptData, setLocal, params.id)),
  )
  createEffect(on(wordLabel, updateAverageWpm(local, setLocal)))
  createEffect(on(wordLabel, updateAverageAccuracy(local, setLocal)))

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
      handleParagraphReset(local, setLocal)
      return
    }

    if (e.key === "Backspace") {
      handleBackspace(e, local, setLocal)
      return
    }

    handleStandardInput(e, local, setLocal)
  }

  onMount(() => {
    window.addEventListener("keydown", handleTyping)
    window.addEventListener("mousemove", () => setLocal("hideCursor", false))
  })

  onCleanup(() => {
    window.removeEventListener("keydown", handleTyping)
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
                  return val !== null ? `${formatNum(val.value)} wpm` : ""
                })

                const acc = createMemo(() => {
                  const val = local.stats?.[paragraphNum()]?.acc
                  return val !== null
                    ? `${formatPercentage(val.value)} acc`
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
                                      typedChar = "_"
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
                                        special: letter === config.ENTER_SYMBOL,
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
