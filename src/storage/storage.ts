import localforage from "localforage"
import {
  BooksIndex,
  Settings,
  StaticBookInfo,
  StaticChapterContent,
} from "../types/common"

class EntriesStorage<T> {
  #database: LocalForage

  constructor(name: string) {
    this.#database = localforage.createInstance({
      name,
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
}

class MixedStorage<T extends { [key: string]: any }> {
  #database: LocalForage

  constructor(name: string) {
    this.#database = localforage.createInstance({
      name,
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
}

type GeneralStore = {
  settings: Settings
  booksIndex: BooksIndex
}

const storage = {
  booksInfo: new EntriesStorage<StaticBookInfo>("booksInfo"),
  booksContent: new EntriesStorage<StaticChapterContent>("booksContent"),
  general: new MixedStorage<GeneralStore>("general"),
}

export default storage
