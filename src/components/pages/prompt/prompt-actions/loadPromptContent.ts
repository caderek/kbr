import { SetStoreFunction } from "solid-js/store"
import type {
  LocalState,
  ParagraphStats,
  PromptData,
  WordStats,
} from "../types"
import type { Resource } from "solid-js"
import { getCharset } from "../../../../libs/charsets"
import config from "../../../../config"
import { getScreenSplitOffsets } from "../prompt-util/getScreenSplitOffsets"

/**
 * Used for fast progress update on each typed word,
 * instead of calculating position of character under caret
 */
function getIncrementalLength(original: string[][][]) {
  const incrementalLength = original.map((p) => p.map(() => 0))

  let len = 0

  for (let p = 0; p < original.length; p++) {
    for (let w = 0; w < original[p].length; w++) {
      incrementalLength[p][w] = len
      len += original[p][w].length
    }
  }

  return incrementalLength
}

/**
 * Divides a chapter into sections of a provided length,
 * so the length page screen:
 * a) does not slow down the browser (some chapters can be very long)
 * b) user can set a desred chunk per screen
 *
 * return indicies of paragraps where the screen should be split
 */
function getScreenSplits(paragraphs: string[], maxCharsPerScreen: number) {
  const paragraphsLengths = paragraphs.map((p) => p.length)

  const splits = [0]
  let tempLen = 0

  for (let i = 0; i < paragraphsLengths.length - 1; i++) {
    tempLen += paragraphsLengths[i]

    if (tempLen + paragraphsLengths[i + 1] > maxCharsPerScreen) {
      splits.push(i + 1)
      tempLen = 0
    }
  }

  splits.push(paragraphsLengths.length)

  return splits
}

export function loadPromptContent(
  promptData: Resource<PromptData>,
  setLocal: SetStoreFunction<LocalState>,
  id: string | null,
) {
  if (promptData() === undefined || promptData.loading || promptData.error) {
    return
  }

  const savedStats = promptData()?.stats ?? []
  const isComplete = (promptData()?.chapterProgress ?? 0) === 1
  const paragraphs = promptData()?.paragraphs ?? []

  const original = paragraphs.map((paragraph) =>
    paragraph
      .split(" ")
      .map((word, i, words) => [
        ...(word + (i === words.length - 1 ? "" : " ")),
      ]),
  )

  const length = promptData()!.chapterInfo?.length ?? 0
  let lengthCompleted = isComplete ? length : 0

  const typed = original.map((paragraph, i) => {
    if (promptData()?.stats[i] && !isComplete) {
      lengthCompleted += promptData()?.stats[i].wpm.weight ?? 0
      return paragraph.map((word) => word.map((char) => char))
    }

    return paragraph.map((word) => word.map((_) => null))
  })

  // @ts-ignore
  const lastCompletedParagraphNum = promptData()?.stats.findLastIndex(Boolean)
  const paragraphNum = isComplete ? 0 : lastCompletedParagraphNum + 1

  const stats = Array.from(
    { length: typed.length },
    (_, i) =>
      ({
        wordCount: original[i].length,
        charCount: original[i].flat().length,
        wpm: savedStats[i]?.wpm ?? null,
        acc: savedStats[i]?.acc ?? null,
        consistency: savedStats[i]?.consistency ?? null,
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

  const incrementalLength = getIncrementalLength(original)
  const screenSplits = getScreenSplits(paragraphs, config.MAX_CHARS_PER_SCREEN)
  const splitOffsets = getScreenSplitOffsets(screenSplits, paragraphNum)

  setLocal({
    id,
    length,
    lengthCompleted,
    charset: getCharset(promptData()!.bookInfo.language ?? "??"),
    hideCursor: false,
    done: false,
    paused: true,
    original,
    typed,
    incrementalLength,
    screenSplits,
    splitStart: splitOffsets.start,
    splitEnd: splitOffsets.end,
    stats,
    pageStats: { acc: null, wpm: null, inputTimes: [] },
    paragraphNum,
    wordNum: 0,
    charNum: 0,
  })
}
