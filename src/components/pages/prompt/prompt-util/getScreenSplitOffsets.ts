export function getScreenSplitOffsets(
  screenSplits: number[],
  paragraphNum: number,
) {
  // @ts-ignore
  const splitIndex = screenSplits.findLastIndex(
    (split: number) => paragraphNum >= split,
  )

  return {
    start: screenSplits[splitIndex],
    end: screenSplits[splitIndex + 1],
  }
}
