import { describe, expect, it } from "vitest"
import { zip } from "./array"

describe("Array helpers - zip", () => {
  it("creates pairs from arrays of equal size", () => {
    const a = [1, 2, 3]
    const b = ["a", "b", "c"]

    const actual = zip(a, b)
    const expected = [
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]

    expect(actual).toEqual(expected)
  })

  it("if second array is longer it ignores these values", () => {
    const a = [1, 2, 3]
    const b = ["a", "b", "c", "d"]

    const actual = zip(a, b)
    const expected = [
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]

    expect(actual).toEqual(expected)
  })

  it("if second array is shorter it uses undefined", () => {
    const a = [1, 2, 3]
    const b = ["a", "b"]

    const actual = zip(a, b)
    const expected = [
      [1, "a"],
      [2, "b"],
      [3, undefined],
    ]

    expect(actual).toEqual(expected)
  })
})
