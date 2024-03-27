import { randomElement } from "../../../utils/random"
import Shape from "./Shape"

const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`

class Text extends Shape {
  #size: number = 16
  #char: string

  constructor(name?: string) {
    super(name)
    this.#char = randomElement(chars)
  }

  size(size: number): this {
    this.#size = size
    return this
  }

  draw(ctx: CanvasRenderingContext2D) {
    this._setStyles(ctx)

    ctx.save()
    ctx.transform(
      this._scaleX,
      this._skewY,
      this._skewX,
      this._scaleY,
      this._x + this._originX,
      this._y + this._originY,
    )

    ctx.rotate(this._rotation)
    ctx.translate(-this._originX, -this._originY)
    ctx.font = `bold ${this.#size}px monospace`
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillText(this.#char, 0, 0)

    ctx.restore()
  }
}

export default Text
