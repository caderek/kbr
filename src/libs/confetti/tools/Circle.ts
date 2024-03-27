import Shape from "./Shape"

class Circle extends Shape {
  #radius: number = 50

  constructor(name?: string) {
    super(name)
  }

  size(radius: number): this
  size(): number
  size(radius?: number): this | number {
    if (radius === undefined) {
      return this.#radius
    }

    this.#radius = radius

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

    ctx.beginPath()
    ctx.arc(0, 0, this.#radius, 0, 2 * Math.PI)
    ctx.closePath()

    if (this._fill) {
      ctx.fill()
    }

    if (this._stroke) {
      ctx.stroke()
    }

    ctx.restore()
  }
}

export default Circle
