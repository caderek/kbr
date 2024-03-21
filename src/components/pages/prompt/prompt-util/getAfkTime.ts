import config from "../../../../config.ts"

export function getAfkTime(times: number[]) {
  let afkTime = 0

  for (let i = 0; i < times.length - 1; i++) {
    const timeDiff = times[i + 1] - times[i]

    if (timeDiff >= config.AFK_BOUNDRY) {
      afkTime += timeDiff - config.AFK_PENALTY
    }
  }

  return afkTime
}
