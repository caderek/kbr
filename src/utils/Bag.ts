export class Bag {
  #data: Map<string, number> = new Map()

  get raw() {
    return this.#data
  }

  add(item: string) {
    this.#data.set(item, (this.#data.get(item) ?? 0) + 1)
    return this
  }

  remove(item: string) {
    if (!this.#data.get(item)) {
      return this
    }

    this.#data.set(item, Math.max(0, (this.#data.get(item) ?? 0) - 1))
  }
}
