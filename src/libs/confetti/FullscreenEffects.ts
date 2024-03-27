import Confetti from "./Confetti"
import Scene from "./tools/Scene"
import { randomFloat } from "../../utils/random"

export class FullscreenEffects {
  #canvas: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D | null
  constructor() {
    this.#canvas = document.createElement("canvas")
    this.#ctx = this.#canvas.getContext("2d")
    console.log(window.innerWidth)
    this.#canvas.width = window.innerWidth * window.devicePixelRatio
    this.#canvas.height = window.innerHeight * window.devicePixelRatio
    this.#canvas.style.position = "fixed"
    this.#canvas.style.top = "0"
    this.#canvas.style.left = "0"
    this.#canvas.style.zIndex = "2"
    this.#canvas.style.width = "100vw"
    this.#canvas.style.height = "100vh"
    this.#canvas.style.pointerEvents = "none"

    document.body.appendChild(this.#canvas)
  }

  init(darkmode: boolean) {
    if (!this.#ctx) {
      console.error("Can't initialize canvas")
      return
    }

    const confetties = Array.from({ length: 8 }, () => {
      return new Confetti(
        this.#canvas.width * randomFloat(0.25, 0.75),
        this.#canvas.height * randomFloat(0.25, 0.75),
        "square",
        8,
      ).load({
        amount: 100,
        fullPalette: false,
        minOpacity: 0.5,
        speed: 10,
        sizeVariation: 0.5,
        darkmode,
      })
    })

    confetties.push(
      new Confetti(
        this.#canvas.width / 2,
        this.#canvas.height / 2,
        "char",
        32,
      ).load({
        amount: 50,
        fullPalette: true,
        minOpacity: 1,
        speed: 10,
        sizeVariation: 0,
        darkmode,
      }),
    )

    const scene = new Scene()
      // .add(new Grid(64, 8))
      .add(...confetties)

    const loop = () => {
      scene.draw(this.#ctx!)
      requestAnimationFrame(loop)
    }

    loop()

    confetties.forEach((confetti, i) => {
      setTimeout(() => confetti.trigger(), (i + 1) * 500)
    })
  }
}
