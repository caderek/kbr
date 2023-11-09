import { createStore } from "solid-js/store"

const defaultState = {
  prompt: {
    text: "",
  },
}

const [state, setState] = createStore(defaultState)

export { state, setState }
