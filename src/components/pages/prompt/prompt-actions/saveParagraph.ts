import state from "../../../../state/state"
import storage from "../../../../storage/storage"
import type {
  FinishedParagraphStats,
  BasicStats,
} from "../../../../types/common"
import { calculateWeightedAverage } from "../../../../utils/math"

function calculateStat(values: number[], weights: number[]) {
  return {
    value: calculateWeightedAverage(values, weights),
    weight: weights.reduce((a, b) => a + b, 0),
  }
}

function sumarizeStats(basicStats: BasicStats[]): BasicStats {
  const wpms = new Array(basicStats.length)
  const rawWpms = new Array(basicStats.length)
  const wpmsWeights = new Array(basicStats.length)
  const accuracies = new Array(basicStats.length)
  const accuraciesWeights = new Array(basicStats.length)
  const consustencies = new Array(basicStats.length)
  const consistenciesWeights = new Array(basicStats.length)

  let time = 0
  let length = 0
  let timestamp = 0

  for (let i = 0; i < basicStats.length; i++) {
    wpms[i] = basicStats[i].wpm.value
    rawWpms[i] = basicStats[i].wpm.raw
    wpmsWeights[i] = basicStats[i].wpm.weight
    accuracies[i] = basicStats[i].acc.value
    accuraciesWeights[i] = basicStats[i].acc.weight
    consustencies[i] = basicStats[i].consistency.value
    consistenciesWeights[i] = basicStats[i].consistency.weight
    time += basicStats[i].time
    length += basicStats[i].length
    timestamp = Math.max(timestamp, basicStats[i].timestamp)
  }

  const wpm = calculateStat(wpms, wpmsWeights)
  const rawWpm = calculateStat(rawWpms, wpmsWeights)

  return {
    wpm: {
      value: wpm.value,
      raw: rawWpm.value,
      weight: wpm.weight,
    },
    acc: calculateStat(accuracies, accuraciesWeights),
    consistency: calculateStat(consustencies, consistenciesWeights),
    time,
    timestamp,
    length,
  }
}

export async function saveParagraph(
  path: string,
  paragraphNum: number,
  chapterLength: number,
  stats: FinishedParagraphStats,
  missedWords: string[],
) {
  try {
    const [bookId, chapterId] = path.split("__")
    const bookLength =
      state.get.booksIndex.find((book) => book.id === bookId)?.length ?? 0

    const existingMissedWords = (await storage.general.get("missedWords")) ?? []
    const paragraphsStats = (await storage.paragraphsStats.get(path)) ?? {}
    const chaptersStats = (await storage.chaptersStats.get(bookId)) ?? {}

    paragraphsStats[paragraphNum] = stats

    const chapterPartialStats = sumarizeStats(Object.values(paragraphsStats))

    const chapterStats = {
      ...chapterPartialStats,
      progress: chapterPartialStats.length / chapterLength,
    }

    chaptersStats[Number(chapterId)] = chapterStats

    const bookPartialStats = sumarizeStats(Object.values(chaptersStats))
    const boookStats = {
      ...bookPartialStats,
      progress: bookPartialStats.length / bookLength,
    }

    const updatedMissedWords = [
      ...new Set([...existingMissedWords, ...missedWords]),
    ]

    await storage.paragraphsStats.set(path, paragraphsStats)
    await storage.chaptersStats.set(bookId, chaptersStats)
    await storage.booksStats.set(bookId, boookStats)
    await storage.general.set("missedWords", updatedMissedWords)

    state.set(
      "booksIndex",
      state.get.booksIndex.findIndex((x) => x.id === bookId),
      "progress",
      boookStats.progress,
    )
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}
