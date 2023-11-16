import config from "../config"
import type { State } from "../types/common"

export class Storage {
  constructor() {}

  // #validate(data: JSON) {
  //   return true
  // }

  save(state: State) {
    localStorage.setItem(config.storageKey, JSON.stringify(state))
  }

  load() {
    const save = localStorage.getItem(config.storageKey)

    if (!save) {
      return null
    }

    try {
      const state = JSON.parse(save)
      return state as State
    } catch {
      return null
    }
  }
}
