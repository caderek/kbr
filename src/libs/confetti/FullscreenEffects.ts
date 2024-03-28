import Confetti from "./Confetti"
import Scene from "./tools/Scene"
import { randomFloat } from "../../utils/random"

export class FullscreenEffects {
  #canvas: HTMLCanvasElement
  #ctx: CanvasRenderingContext2D | null
  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas
    this.#ctx = this.#canvas.getContext("2d")
    this.#canvas.width = window.innerWidth * window.devicePixelRatio
    this.#canvas.height = window.innerHeight * window.devicePixelRatio
  }

  init(darkmode: boolean, isMobile: boolean) {
    if (!this.#ctx) {
      console.error("Can't initialize canvas")
      return
    }

    const confetties = Array.from({ length: 9 }, () => {
      return new Confetti(
        this.#canvas.width * randomFloat(0.25, 0.75),
        this.#canvas.height * randomFloat(0.25, 0.75),
        "square",
        6,
      ).load({
        amount: isMobile ? 100 : 300,
        fullPalette: false,
        minOpacity: 0.5,
        speed: 30,
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
        amount: isMobile ? 80 : 150,
        fullPalette: true,
        minOpacity: 1,
        speed: 30,
        sizeVariation: 0.2,
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
      setTimeout(() => confetti.trigger(), (i + 1) * 750)
    })
  }
}
