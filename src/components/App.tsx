import "./App.css"
import Prompt from "./prompt/Prompt.tsx"
import Header from "./header/Header.tsx"
// import Results from "./results/Results.tsx"

function App() {
  return (
    <>
      <Header />
      <main>
        <Prompt />
        {/* <Results /> */}
      </main>
    </>
  )
}

export default App
