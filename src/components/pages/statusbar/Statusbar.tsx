import "./Statusbar.css"
import { Component, createMemo, Show } from "solid-js"
import { formatNum } from "../../../utils/formatters.ts"

type Props = {
  bookId: string | null
  bookTitle: string | null
  chapterTitle: string | null
  acc: number | null
  wpm: number | null
  paused: boolean
  page: number
  pages: number
}

const Statusbar: Component<Props> = (props) => {
  const liveAcc = createMemo(() => (props.acc !== null ? formatNum(props.acc * 100, 1) : "-"))
  const liveWpm = createMemo(() => (props.wpm !== null ? formatNum(props.wpm, 1) : "-"))
  return (
    <section class="statusbar">
      <p class="slug">
        <Show when={props.bookTitle}>
          <a href={`/books/${props.bookId}`}>{props.bookTitle}</a> /{" "}
        </Show>
        <Show when={props.chapterTitle}>
          <strong>{props.chapterTitle}</strong>
        </Show>
      </p>
      <p class="stats">
        <Show when={props.paused}>
          <span class="warning">
            <strong>PAUSED</strong>
          </span>
        </Show>
        <span>
          PAGE <strong>{props.page}</strong>/{props.pages}
        </span>
        <span>
          <strong>{liveWpm()}</strong> wpm
        </span>
        <span
          classList={{
            ok: props.acc !== null && props.acc >= 0.95,
            warning: props.acc !== null && props.acc < 0.95,
            error: props.acc !== null && props.acc < 0.9,
          }}
        >
          <strong>{liveAcc()}</strong>% acc
        </span>
      </p>
      <div class="progressbar">
        <div style={`width: ${0.5 * 100}%`}></div>
      </div>
    </section>
  )
}

export default Statusbar
