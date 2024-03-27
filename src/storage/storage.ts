import localforage from "localforage"
import {
  BookStats,
  BooksIndex,
  ChapterStats,
  FinishedParagraphStats,
  Settings,
  StaticBookInfo,
  StaticChapterContent,
} from "../types/common"

class EntriesStorage<T> {
  #database: LocalForage

  constructor(name: string) {
    this.#database = localforage.createInstance({
      name: "main",
      storeName: name,
      driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    })
  }

  get(key: string): Promise<T | null> {
    return this.#database.getItem(key)
  }

  set(key: string, value: T) {
    return this.#database.setItem(key, value)
  }

  remove(key: string) {
    return this.#database.removeItem(key)
  }

  keys() {
    return this.#database.keys()
  }
}

class MixedStorage<T extends { [key: string]: any }> {
  #database: LocalForage

  constructor(name: string) {
    this.#database = localforage.createInstance({
      name: "main",
      storeName: name,
      driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    })
  }

  async setDefaults(defaults: T) {
    const keys = new Set(await this.#database.keys())

    for (const [key, val] of Object.entries(defaults)) {
      if (!keys.has(key)) {
        await this.set(key, val)
      }
    }
  }

  async get<K extends keyof T>(key: K): Promise<T[K] | null> {
    return this.#database.getItem(key as string)
  }

  async set<K extends keyof T>(key: K, value: T[K]) {
    await this.#database.setItem(key as string, value)
  }

  async remove(key: keyof T) {
    await this.#database.removeItem(key as string)
  }

  keys() {
    return this.#database.keys()
  }
}

type GeneralStorage = {
  settings: Settings
  booksIndex: BooksIndex
  missedWords: string[]
  favorites: string[]
}

const storage = {
  booksInfo: new EntriesStorage<StaticBookInfo>("booksInfo"),
  booksStats: new EntriesStorage<BookStats>("booksStats"),
  chaptersStats: new EntriesStorage<{ [index: number]: ChapterStats }>(
    "chaptersStats",
  ),
  paragraphsStats: new EntriesStorage<{
    [index: number]: FinishedParagraphStats
  }>("paragraphsStats"),
  booksContent: new EntriesStorage<StaticChapterContent>("booksContent"),
  general: new MixedStorage<GeneralStorage>("general"),
}

export default storage
