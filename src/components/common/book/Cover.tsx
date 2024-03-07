import "./Cover.css"
import { Component } from "solid-js"

const Cover: Component<{ url: string }> = (props) => {
  const style = `background-image: url(${props.url})`

  return (
    <div class="cover">
      <div style={style}></div>
    </div>
  )
}

export default Cover
