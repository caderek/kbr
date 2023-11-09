import { go } from "../actions/actions"

document.addEventListener("keydown", (e) => {
  if (e.altKey) {
    e.preventDefault()
  }

  switch (e.key) {
    case "Enter":
      return go()
  }
})
