import CanvasElement from "./CanvasElement"

export interface Drawable {
  name?: string
  draw(ctx: CanvasRenderingContext2D): void
}

class Container extends CanvasElement {
  protected _children: Drawable[] = []

  constructor(name?: string) {
    super(name)
  }

  add(...children: Drawable[]) {
    for (const child of children) {
      this._children.push(child)
    }

    return this
  }

  remove(child: Drawable): this
  remove(childName: string): this
  remove(child: Drawable | string) {
    if (typeof child === "string") {
      this._children = this._children.filter((item) => item.name !== child)
    } else {
      this._children = this._children.filter((item) => item !== child)
    }

    return this
  }

  draw(ctx: CanvasRenderingContext2D) {
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

    for (const child of this._children) {
      child.draw(ctx)
    }
    ctx.restore()
  }
}

export default Container
