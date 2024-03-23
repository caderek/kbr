const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Options = {
  wpm: number
  delayBetweenParagraphs: number
  randomize: boolean
}

const defaultOptions: Options = {
  wpm: 100,
  delayBetweenParagraphs: 200,
  randomize: false,
}

export async function simulateTyping(text: string, options: Partial<Options>) {
  const { wpm, delayBetweenParagraphs, randomize } = {
    ...defaultOptions,
    ...options,
  }

  const lines = text.split(/\n+/).map((p) => [...p.split(""), "Enter"])
  let averageKeyDelay = 1000 / ((wpm * 5) / 60) - 2

  for (const line of lines) {
    const events = line.map((key) => new KeyboardEvent("keydown", { key }))

    for (let i = 0; i < events.length; i++) {
      const keyDelay = randomize
        ? averageKeyDelay * (Math.random() + 0.5)
        : averageKeyDelay

      await delay(keyDelay)
      window.dispatchEvent(events[i])
    }

    await delay(delayBetweenParagraphs)
  }
}
