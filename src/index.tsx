import "./index.css"
import { render } from "solid-js/web"
import { Router, Route } from "@solidjs/router"
import "./boot/registerKeybindings.ts"
import App from "./components/App"
import Prompt from "./components/pages/prompt/Prompt.tsx"
import Books from "./components/pages/books/Books"
import BookDetails from "./components/pages/book-details/BookDetails.tsx"
import prepareBooks from "./prepareBooks.ts"
import { simulateTyping } from "./simulateTyping.ts"
import { Epub } from "./libs/ebook/epub.ts"
import { speak } from "./libs/tts/speak.ts"
import Results from "./components/pages/results/Results.tsx"

const temp = async () => {
  const res = await fetch(
    // "/raw-books/epub_public_domain_se/lord-dunsany_fifty-one-tales.epub",
    "/raw-books/epub_creative_commons/blindsight.epub",
  )
  const blob = await res.blob()

  const epub = new Epub(blob)
  const book = await epub.load()

  console.log(book)
}

// temp()

// @ts-ignore
window.prepareBooks = prepareBooks
// @ts-ignore
window.simulateTyping = simulateTyping
// @ts-ignore
window.speak = speak

const root = document.getElementById("root")

render(
  () => (
    <Router root={App}>
      <Route path="/" component={() => <h2>Home</h2>} />
      <Route path="/books" component={Books} />
      <Route path="/books/:id" component={BookDetails} />
      <Route path="/stats" component={() => <h2>Stats</h2>} />
      <Route path="/settings" component={() => <h2>Settings</h2>} />
      <Route path="/profile" component={() => <h2>Profle</h2>} />
      <Route path="/prompt" component={Prompt} />
      <Route path="/prompt/:id" component={Prompt} />
      <Route path="/results/:id" component={Results} />
      <Route path="*404" component={() => <h1>Not Found</h1>} />
    </Router>
  ),
  root!,
)
