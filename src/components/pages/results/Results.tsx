import "./Results.css"
import { Component } from "solid-js"
import { useParams } from "@solidjs/router"

const Results: Component = () => {
  const params = useParams()
  return <section class="results">RESULTS {params.id}</section>
}

export default Results
