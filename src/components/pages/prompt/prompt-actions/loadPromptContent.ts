import { SetStoreFunction } from "solid-js/store"
import type {
  LocalState,
  ParagraphStats,
  PromptData,
  WordStats,
} from "../types"
import type { Resource } from "solid-js"
import { getCharset } from "../../../../libs/charsets"

export function loadPromptContent(
  promptData: Resource<PromptData>,
  setLocal: SetStoreFunction<LocalState>,
  id: string | null,
) {
  if (promptData() === undefined || promptData.loading || promptData.error) {
    return
  }

  console.log({ promptData: promptData() })

  // @ts-ignore
  window.chapter = promptData()?.paragraphs?.join("\n")

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
        wordCount: original[i].length,
        charCount: original[i].flat().length,
        wpm: null,
        acc: null,
        consistency: null,
        inputTimes: [],
        typos: 0,
        nonTypos: 0,
        words: original[i].map(
          (chars) =>
            ({
              length: chars.length,
              typedLength: 0,
              times: [],
              isCorrect: true,
              hadTypos: false,
              typosIndicies: [],
            }) as WordStats,
        ),
      }) as ParagraphStats,
  )

  setLocal({
    id,
    length: promptData()!.chapterInfo?.length,
    charset: getCharset(promptData()!.bookInfo.language ?? "??"),
    hideCursor: false,
    done: false,
    paused: true,
    original,
    typed: empty,
    stats,
    pageStats: { acc: null, wpm: null, inputTimes: [] },
    paragraphNum: 0,
    wordNum: 0,
    charNum: 0,
  })
}
