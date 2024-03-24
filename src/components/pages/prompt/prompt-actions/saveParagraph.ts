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
  const completed = basicStats.filter(Boolean)

  const wpms = new Array(completed.length)
  const wpmsWeights = new Array(completed.length)
  const accuracies = new Array(completed.length)
  const accuraciesWeights = new Array(completed.length)
  const consustencies = new Array(completed.length)
  const consistenciesWeights = new Array(completed.length)

  for (let i = 0; i < completed.length; i++) {
    wpms[i] = completed[i].wpm.value
    wpmsWeights[i] = completed[i].wpm.weight
    accuracies[i] = completed[i].acc.value
    accuraciesWeights[i] = completed[i].acc.weight
    consustencies[i] = completed[i].consistency.value
    consistenciesWeights[i] = completed[i].consistency.weight
  }

  return {
    wpm: calculateStat(wpms, wpmsWeights),
    acc: calculateStat(accuracies, accuraciesWeights),
    consistency: calculateStat(consustencies, consistenciesWeights),
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
    const paragraphsStats = (await storage.paragraphsStats.get(path)) ?? []
    const chaptersStats = (await storage.chaptersStats.get(bookId)) ?? []

    paragraphsStats[paragraphNum] = stats

    const paragraphsTypedLength = paragraphsStats.reduce(
      (sum, p) => sum + p.wpm.weight,
      0,
    )

    const chapterStats = {
      ...sumarizeStats(paragraphsStats),
      length: paragraphsTypedLength,
      progress: paragraphsTypedLength / chapterLength,
    }

    chaptersStats[Number(chapterId)] = chapterStats

    const chaptersTypedLength = chaptersStats.reduce(
      (sum, c) => sum + c.length,
      0,
    )

    const boookStats = {
      ...sumarizeStats(chaptersStats),
      length: chaptersTypedLength,
      progress: chaptersTypedLength / bookLength,
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
