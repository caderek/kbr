export function zip<T, V>(arr1: T[], arr2: V[]): [T, V][] {
  const zipped = new Array(arr1.length)

  for (let i = 0; i < arr1.length; i++) {
    zipped[i] = [arr1[i], arr2[i]]
  }

  return zipped
}
