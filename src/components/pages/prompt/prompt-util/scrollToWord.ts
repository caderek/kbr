export function scrollToWord(prev: number = -1) {
  const node = document.querySelector(".word.active") as HTMLSpanElement

  if (node) {
    const offset = window.scrollY + node.getBoundingClientRect().top

    if (offset !== prev) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      return offset
    }
  }

  return prev
}
