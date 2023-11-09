export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function randomElement<T>(arr: T[]) {
  return arr[randomInt(0, arr.length)]
}
