export function calculateWpm(time: number, charsCount: number) {
  const cps = charsCount / (time / 1000)
  return (cps * 60) / 5
}
