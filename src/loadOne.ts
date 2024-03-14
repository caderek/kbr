import state from "./state/state.ts"
import { loadEpub } from "./loadEpub.ts"

async function loadOne() {
  const book = await loadEpub()

  const chapterNum = 20
  const paragraphs = book.chapters[chapterNum].paragraphs.slice(0)
  // const paragraphs = new Array(20).fill("the")
  // const paragraphs = ["the hello", "the little", "the again"]
  // const paragraphs = ["out there again have so school get the must very"]
  //
  // const paragraphs = [
  //   'Please retype this text to set your initial "words per minute" speed. Press Enter to finish each paragraph.',
  //   "The timer starts when you type the first letter, and it will automatically pause, if it detects that you are inactive for five seconds.",
  //   "You can restart the current paragraph by pressing Tab, but it's usually better to fix your mistakes and continue typing. Words that contain unfixed typos are not counted towards your final score.",
  //   "If you encounter some special characters, you can press any letter (or space) to mark them as typed. For example, try it with a word naïve or 你好.",
  //   "You are now ready to begin your typing adventure!",
  // ]

  state.set(
    "prompt",
    "paragraphs",
    paragraphs.map((x) => x + "⏎"),
  )

  state.set("prompt", "bookId", "the-study-in-scarlet")
  state.set("prompt", "bookTitle", book.info.title)
  state.set("prompt", "chapterTitle", book.chapters[chapterNum].title)
  // state.set("prompt", "chapterTitle", "Introduction - Initial Speed Test")
  state.set("prompt", "page", 1000)
  state.set("prompt", "pages", 1234)

  console.log("PAGES:")

  console.log(
    "Pages:",
    book.chapters[chapterNum].paragraphs.join(" ").length / (5 * 300),
  )
  console.log("Words on this page:", paragraphs.join(" ").length / 5)
}

export default loadOne
