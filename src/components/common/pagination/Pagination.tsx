import { Component, For, Show, createMemo } from "solid-js"
import "./Pagination.css"

type Props = {
  page: number
  of: number
  change: (page: number) => void
}

type ButtonData = {
  type: "prev" | "next" | "direct" | "dots"
  disabled: boolean
  val: number
}

const Pagination: Component<Props> = (props) => {
  const buttons = createMemo(() => {
    if (props.of < 10) {
      return Array.from({ length: props.of }, (_, i) => ({
        type: "direct",
        disabled: false,
        val: i + 1,
      }))
    }

    const of = props.of
    const page = props.page
    const x: ButtonData[] = new Array(9).fill({
      type: "direct",
      disabled: false,
      val: 1,
    })
    x[0] = { type: "prev", disabled: page === 1, val: page - 1 }
    x[1] = { type: "direct", disabled: false, val: 1 }
    x[2] = { type: page < 5 ? "direct" : "dots", disabled: page >= 5, val: 2 }
    x[3] = {
      type: "direct",
      disabled: false,
      val: page < 5 ? 3 : page > of - 4 ? of - 4 : page - 1,
    }
    x[4] = {
      type: "direct",
      disabled: false,
      val: page < 5 ? 4 : page > of - 4 ? of - 3 : page,
    }
    x[5] = {
      type: "direct",
      disabled: false,
      val: page < 5 ? 5 : page > of - 4 ? of - 2 : page + 1,
    }
    x[6] = {
      type: page > of - 4 ? "direct" : "dots",
      disabled: page <= of - 4,
      val: of - 1,
    }
    x[7] = { type: "direct", disabled: false, val: of }
    x[8] = { type: "next", disabled: page === of, val: page + 1 }

    return x
  })

  return (
    <Show when={props.of > 1}>
      <nav class="pagination">
        <For each={buttons()}>
          {(button) => (
            <button
              classList={{
                [button.type]: true,
                current: button.type === "direct" && button.val === props.page,
              }}
              disabled={button.disabled}
              onClick={() => {
                if (!button.disabled) {
                  props.change(button.val)
                }
              }}
            >
              {button.type === "direct"
                ? String(button.val)
                : button.type === "dots"
                  ? ".."
                  : ""}
            </button>
          )}
        </For>
      </nav>
    </Show>
  )
}

export default Pagination
