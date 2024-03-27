import { mod } from "../../utils/math"
import { randomElement, randomFloat, randomInt } from "../../utils/random"
import { Rectangle } from "./tools"
import Shape from "./tools/Shape"
import Text from "./tools/Text"

const paletteDark = [
  "#f44336",
  "#e81e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
]

const paletteLight = [
  "#c93f39",
  "#b62555",
  "#7a2986",
  "#5a398c",
  "#3d498a",
  "#1e5da5",
  "#0c69a6",
  "#087081",
  "#07746c",
  "#46864a",
  "#5a7935",
  "#828c2c",
  "#cd8b2a",
  "#d27810",
  "#d25f0c",
  "#d53e21",
]

interface Particle {
  shape: Shape
  dX: number
  dY: number
  speed: number
  dAngle: number
  angleSpeed: number
  dead: boolean
  color: string
  alpha: number
}

type Options = {
  fullPalette: boolean
  minOpacity: number
  sizeVariation: number
  speed: number
  amount: number
  darkmode: boolean
}

const defaultOptions: Options = {
  fullPalette: false,
  minOpacity: 0.5,
  sizeVariation: 0.5,
  speed: 10,
  amount: 250,
  darkmode: false,
}

class Confetti {
  #x
  #y
  #type: "char" | "square"
  #size: number
  #particles: Particle[] = []
  #gravity = 5
  #drag = 0.02
  #running = false
  #ticks = 0

  constructor(x: number, y: number, type: "char" | "square", size: number) {
    this.#x = x
    this.#y = y
    this.#type = type
    this.#size = size
  }

  load(options: Partial<Options>) {
    const { amount, speed, minOpacity, sizeVariation, fullPalette, darkmode } =
      {
        ...defaultOptions,
        ...options,
      }

    this.#running = false
    this.#particles = []

    const palette = darkmode ? paletteDark : paletteLight
    const colorIndex = randomInt(0, palette.length)

    const colors = fullPalette
      ? palette
      : [
          palette[mod(colorIndex - 1, palette.length)],
          palette[colorIndex],
          palette[mod(colorIndex + 1, palette.length)],
        ]

    for (let i = 0; i < amount; i++) {
      const dX = Math.random() * (Math.random() > 0.5 ? 1 : -1)
      const dY = Math.random() * (Math.random() > 0.5 ? 1 : -1)
      const dAngle = randomFloat(0.5, 1.5) * (Math.random() > 0.5 ? 1 : -1)
      const color = randomElement(colors)
      const alpha = randomInt(Math.floor(minOpacity * 256), 256)
      const alphaHex = alpha.toString(16).padStart(2, "0")

      const size = Math.round(
        randomFloat(
          this.#size * (1 - sizeVariation),
          this.#size * (1 + sizeVariation),
        ),
      )

      const shape =
        this.#type === "char"
          ? new Text()
              .size(size)
              .position(this.#x, this.#y)
              .fill(color)
              .angle(Math.floor(Math.random() * 90))
          : new Rectangle()
              .size(size)
              .origin(size / 2)
              // .round(size / 2)
              .position(this.#x, this.#y)
              .fill(`${color}${alphaHex}`)
              .angle(Math.floor(Math.random() * 90))

      this.#particles.push({
        shape,
        dX,
        dY,
        dAngle,
        speed: speed * randomFloat(0.05, 1),
        angleSpeed: randomFloat(1, 5),
        dead: false,
        color,
        alpha,
      })
    }

    return this
  }

  trigger() {
    this.#running = true
  }

  #updateparticle(particle: Particle) {
    const magnitude = Math.hypot(particle.dX, particle.dY)
    particle.shape.move(
      (particle.dX * particle.speed) / magnitude,
      (particle.dY * particle.speed) / magnitude + this.#gravity,
    )

    particle.shape.angle(
      particle.shape.angle() + particle.dAngle * particle.angleSpeed,
    )

    particle.speed = particle.speed * (1 - this.#drag)

    if (this.#type === "square" && this.#ticks > 60) {
      particle.alpha = Math.max(particle.alpha - 1, 0)
      const alphaHex = particle.alpha.toString(16).padStart(2, "0")
      particle.shape.fill(`${particle.color}${alphaHex}`)
    }
  }

  #drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
    particle.shape.draw(ctx)
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.#running) {
      let dead = 0

      for (let i = 0; i < this.#particles.length; i++) {
        const x = this.#particles[i].shape.x
        const y = this.#particles[i].shape.y
        const particle = this.#particles[i]
        let visible = true

        if (particle.dead) {
          dead++
          visible = false
        }

        if (
          x < 0 ||
          x > ctx.canvas.width ||
          y > ctx.canvas.height ||
          particle.alpha === 0
        ) {
          particle.dead = true
          visible = false
        }

        if (y < 0) {
          visible = false
        }

        if (visible) {
          this.#drawParticle(ctx, particle)
        }

        this.#updateparticle(particle)
      }

      if (dead === this.#particles.length) {
        this.#running = false
      }

      this.#ticks++
    }
  }
}

export default Confetti
