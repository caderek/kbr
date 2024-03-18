import { ParentComponent } from "solid-js"
import "./App.css"
import Header from "./common/header/Header.tsx"
import { Epub } from "../libs/ebook/epub.ts"

const temp = async () => {
  const res = await fetch(
    "/raw-books/epub_public_domain_se/agatha-christie_the-murder-of-roger-ackroyd.epub",
  )
  const blob = await res.blob()

  const epub = new Epub(blob)
  const book = await epub.load()

  console.log(book)
}

temp()

const App: ParentComponent = (props) => {
  return (
    <>
      <Header />
      <main>{props.children}</main>
    </>
  )
}

export default App
