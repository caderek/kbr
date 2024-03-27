export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function randomElement<T>(arr: T[] | string) {
  return arr[randomInt(0, arr.length)]
}
