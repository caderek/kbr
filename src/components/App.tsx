import { ParentComponent } from "solid-js"
import "./App.css"
import Header from "./common/header/Header.tsx"

const App: ParentComponent = (props) => {
  return (
    <>
      <Header />
      <main>{props.children}</main>
    </>
  )
}

export default App
