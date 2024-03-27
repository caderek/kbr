class Grid {
  size
  subdivisions
  colors = {
    main: "#ffffff22",
    center: "#ffffff22",
    subdivisions: "#ffffff11",
  }
  #divisionWidth = 2
  #subdivisionWidth = 1
  #hasCenter

  constructor(size: number, subdivisions: number) {
    this.size = size
    this.subdivisions = subdivisions
    this.#hasCenter = subdivisions % 2 === 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    ctx.strokeStyle = this.colors.subdivisions
    ctx.lineWidth = this.#subdivisionWidth
    ctx.beginPath()

    for (let i = 0; i <= ctx.canvas.width; i += this.size / this.subdivisions) {
      if (
        i % this.size === 0 ||
        (this.#hasCenter && i % (this.size / 2) === 0)
      ) {
        continue
      }

      ctx.moveTo(i, 0)
      ctx.lineTo(i, ctx.canvas.height)
      ctx.moveTo(0, i)
      ctx.lineTo(ctx.canvas.width, i)
    }
    ctx.stroke()

    if (this.#hasCenter) {
      ctx.strokeStyle = this.colors.center
      ctx.beginPath()

      for (let i = 0; i <= ctx.canvas.width; i += this.size) {
        const a = i + this.size / 2
        ctx.moveTo(a, 0)
        ctx.lineTo(a, ctx.canvas.height)
        ctx.moveTo(0, a)
        ctx.lineTo(ctx.canvas.width, a)
      }

      ctx.stroke()
    }

    ctx.strokeStyle = this.colors.main
    ctx.lineWidth = this.#divisionWidth
    ctx.beginPath()

    for (let i = 0; i <= ctx.canvas.width; i += this.size) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i, ctx.canvas.height)
      ctx.moveTo(0, i)
      ctx.lineTo(ctx.canvas.width, i)
    }

    ctx.stroke()
  }
}

export default Grid
