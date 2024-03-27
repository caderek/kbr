import CanvasElement from "./CanvasElement"

abstract class Shape extends CanvasElement {
  protected _fill = false
  protected _stroke = false
  protected _fillColor = "#000"
  protected _strokeColor = "#000"
  protected _strokeWidth = 0
  protected _strokeSegments: number[] = []

  constructor(name?: string) {
    super(name)
  }

  fill(color: string) {
    this._fill = true
    this._fillColor = color
    return this
  }

  stroke(color: string, width: number, segments: number[] = []) {
    if (width > 0) {
      this._stroke = true
      this._strokeColor = color
      this._strokeWidth = width
      this._strokeSegments = segments
    }

    return this
  }

  protected _setStyles(ctx: CanvasRenderingContext2D) {
    if (this._fill) {
      ctx.fillStyle = this._fillColor
    }

    if (this._stroke) {
      ctx.lineWidth = this._strokeWidth
      ctx.strokeStyle = this._strokeColor
      ctx.setLineDash(this._strokeSegments)
    }
  }
}

export default Shape
