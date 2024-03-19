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
) {
  if (promptData() === undefined || promptData.loading || promptData.error) {
    return
  }

  setLocal("charset", getCharset(promptData()!.bookInfo.language ?? "??"))

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
        totalKeystrokes: 0,
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
}
