import { describe, expect, it } from "vitest"
import { getNgrams } from "./ngrams"

describe("Ngrams", () => {
  it("retrieves ngrams from a list of words", async () => {
    const words = ["hello", "world", "worm"]
    const expectedNgrams = new Set([
      "hel",
      "ell",
      "llo",
      "wor",
      "orl",
      "rld",
      "orm",
    ])
    const actual = getNgrams(words, 3)

    expect(actual.size).toEqual(7)
    expect(actual).toEqual(expectedNgrams)
  })
})
