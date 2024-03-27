export type Point = [x: number, y: number]
export type Scale = [scaleX: number, scaleY: number]
export type Skew = [skewX: number, skewY: number]

export type Transformations = {
  x: number
  y: number
  originX: number
  originY: number
  rotation: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  zIndex: number
}

abstract class CanvasElement {
  protected _x = 0
  protected _y = 0
  protected _originX = 0
  protected _originY = 0
  protected _name
  protected _rotation = 0
  protected _scaleX = 1
  protected _scaleY = 1
  protected _skewX = 0
  protected _skewY = 0
  protected _zIndex = 0

  constructor(name?: string) {
    this._name = name
  }

  position(x: number, y: number): this
  position(xy: number): this
  position(): Point
  position(a?: number, b?: number): this | Point {
    if (a === undefined) {
      return [this._x, this._y]
    }

    if (b === undefined) {
      this._x = a
      this._y = a
    } else {
      this._x = a
      this._y = b
    }

    return this
  }

  origin(x: number, y: number): this
  origin(xy: number): this
  origin(): Point
  origin(a?: number, b?: number): this | Point {
    if (a === undefined) {
      return [this._originX, this._originY]
    }

    if (b === undefined) {
      this._originX = a
      this._originY = a
    } else {
      this._originX = a
      this._originY = b
    }

    return this
  }

  get name() {
    return this._name
  }

  move(x: number, y: number): this
  move(xy: number): this
  move(a: number, b?: number) {
    if (b === undefined) {
      this._x += a
      this._y += a
    } else {
      this._x += a
      this._y += b
    }

    return this
  }

  rotation(radians: number): this
  rotation(): number
  rotation(radians?: number): this | number {
    if (radians === undefined) {
      return this._rotation
    }

    this._rotation = radians
    return this
  }

  angle(degrees: number): this
  angle(): number
  angle(degrees?: number): this | number {
    if (degrees === undefined) {
      return this._rotation * (180 / Math.PI)
    }

    this._rotation = degrees * (Math.PI / 180)
    return this
  }

  scale(scaleXY: number): this
  scale(scaleX: number, scaleY: number): this
  scale(): Scale
  scale(a?: number, b?: number): this | Scale {
    if (a === undefined) {
      return [this._scaleX, this._scaleY]
    }

    if (b === undefined) {
      this._scaleX = a
      this._scaleY = a
    } else {
      this._scaleX = a
      this._scaleY = b
    }

    return this
  }

  skew(skewXY: number): this
  skew(skewX: number, skewY: number): this
  skew(): Skew
  skew(a?: number, b?: number): this | Skew {
    if (a === undefined) {
      return [this._skewX, this._skewY]
    }

    if (b === undefined) {
      this._skewX = a
      this._skewY = a
    } else {
      this._skewX = a
      this._skewY = b
    }

    return this
  }

  zIndex(val: number): this
  zIndex(): number
  zIndex(val?: number): this | number {
    if (val === undefined) {
      return this._zIndex
    }

    this._zIndex = val
    return this
  }

  abstract draw(
    ctx: CanvasRenderingContext2D,
    transformations?: Transformations,
  ): void
}

export default CanvasElement
