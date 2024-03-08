import { render } from "solid-js/web"
import { Router, Route } from "@solidjs/router"
import "./boot/registerKeybindings.ts"
import App from "./components/App"
import Prompt from "./components/pages/prompt/Prompt"
import Books from "./components/pages/books/Books"
import "./index.css"
// import loadOne from "./loadOne.ts"
import prepareBooks from "./prepareBooks.ts"

// loadOne()
// @ts-ignore
window.prepareBooks = prepareBooks

const root = document.getElementById("root")

render(
  () => (
    <Router root={App}>
      <Route path="/" component={() => <h2>Home</h2>} />
      <Route path="/books" component={Books} />
      <Route path="/books/:id" component={() => <h2>Book details</h2>} />
      <Route path="/stats" component={() => <h2>Stats</h2>} />
      <Route path="/settings" component={() => <h2>Settings</h2>} />
      <Route path="/profile" component={() => <h2>Profle</h2>} />
      <Route path="/prompt" component={Prompt} />
      <Route path="*404" component={() => <h1>Not Found</h1>} />
    </Router>
  ),
  root!,
)
