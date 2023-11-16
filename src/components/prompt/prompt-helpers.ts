export function getStroke(e: InputEvent) {
  if (e.inputType === "deleteContentBackward") {
    return "backspace"
  }

  if (e.inputType === "deleteWordBackward") {
    return "ctrl+backspace"
  }

  if (e.inputType === "insertText" && e.data === null) {
    return "\n"
  }

  if (e.inputType === "insertText" && e.data !== null) {
    return e.data
  }

  console.log(e)
  return "unkonwn"
}

export function addStrokeToText(currentText: string, stroke: string) {
  if (stroke === "backspace") {
    return currentText.slice(0, -1)
  }

  if (stroke === "ctrl+backspace") {
    // @todo test correct behavior for enter
    return currentText.replace(/[^\s]+[\s]*$/, "")
  }

  if (stroke === "unknown") {
    return currentText
  }

  return currentText + stroke
}

export function getLetterStyles(task: string, input: string) {
  const styles = []

  for (const [index, letter] of [...task].entries()) {
    const style =
      letter === input[index] ? "ok" : input[index] === undefined ? "" : "error"

    styles.push(style)
  }

  return styles
}
