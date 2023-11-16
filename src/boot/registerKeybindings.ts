import { go } from "../actions/actions"

document.addEventListener("keydown", (e) => {
  if (e.key == "Tab") {
    e.preventDefault()
    location.reload()
  }

  if (!e.altKey) {
    return
  }

  e.preventDefault()

  switch (e.key) {
    case "Enter":
      return go()
  }
})
