export function debounce(fn: (...args: any[]) => void, time = 500) {
  let timer: NodeJS.Timeout

  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(fn, time, ...args)
  }
}
