import "./Confetti.css"
import { Component, onCleanup, onMount } from "solid-js"
import { FullscreenEffects } from "../../../libs/confetti/FullscreenEffects"
import state from "../../../state/state"
import config from "../../../config"

const Confetti: Component = () => {
  let canvasRef: HTMLCanvasElement | undefined
  let fse: FullscreenEffects | undefined

  onMount(() => {
    fse = new FullscreenEffects(canvasRef!)
    fse.init(state.get.settings.darkmode, config.IS_MOBILE)
  })

  onCleanup(() => {})

  return <canvas class="confetti" ref={canvasRef}></canvas>
}

export default Confetti
