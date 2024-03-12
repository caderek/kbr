import localforage from "localforage"

class Storage<T> {
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

type BookInfo = {
  chapters: string[]
}

const storage = {
  booksInfo: new Storage<BookInfo>("booksInfo"),
  booksContent: new Storage("booksContent"),
  settings: new Storage("settings"),
}

export { Storage }
export default storage
