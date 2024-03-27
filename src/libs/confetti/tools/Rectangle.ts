import Shape from "./Shape"

type Size = [width: number, height: number]

class Rectangle extends Shape {
  #width: number = 100
  #height: number = 100
  #radii: number[] = []

  constructor(name?: string) {
    super(name)
  }

  size(width: number, height: number): this
  size(size: number): this
  size(): Size
  size(a?: number, b?: number): this | Size {
    if (a === undefined) {
      return [this.#width, this.#height]
    }

    this.#width = a
    this.#height = b !== undefined ? b : a

    return this
  }

  round(): number[]
  round(all: number): this
  round(topLeftBottomRight: number, topRightBottomLeft: number): this
  round(topLeft: number, topRightBottomLeft: number, bottomRight: number): this
  round(
    topLeft: number,
    topRight: number,
    bottomRight: number,
    bottomLeft: number,
  ): this
  round(...radii: number[]): this | number[] {
    if (radii.length === 0) {
      return [...this.#radii]
    }

    this.#radii = [...radii]
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

    if (this.#radii.length > 0) {
      ctx.beginPath()
      ctx.roundRect(0, 0, this.#width, this.#height, this.#radii)
      ctx.closePath()

      if (this._fill) {
        ctx.fill()
      }

      if (this._stroke) {
        ctx.stroke()
      }
    } else {
      if (this._fill) {
        ctx.fillRect(0, 0, this.#width, this.#height)
      }

      if (this._stroke) {
        ctx.strokeRect(0, 0, this.#width, this.#height)
      }
    }

    ctx.restore()
  }
}

export default Rectangle
