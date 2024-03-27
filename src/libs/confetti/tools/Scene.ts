import Container from "./Container"

class Scene extends Container {
  clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.clear(ctx)
    super.draw(ctx)
  }
}

export default Scene
