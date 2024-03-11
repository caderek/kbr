import { Component, createSignal, Show } from "solid-js"
import "./Header.css"
import state from "../../../state/state"

const Navigation: Component<{ desktop: boolean; linkAction?: () => void }> = (props) => {
  return (
    <>
      <nav classList={{ menu: true, desktop: props.desktop }}>
        <ul>
          <li>
            <a href="/" onClick={props.linkAction}>
              <i class="icon-home" /> <span>Home</span>
            </a>
          </li>
          <li>
            <a href="/books" onClick={props.linkAction}>
              <i class="icon-books" /> <span>Books</span>
            </a>
          </li>
          <li>
            <a href="/stats" onClick={props.linkAction}>
              <i class="icon-stats" /> <span>Stats</span>
            </a>
          </li>
        </ul>
      </nav>
      <nav classList={{ profile: true, desktop: props.desktop }}>
        <ul>
          <li
            title="Toggle dark mode"
            onClick={() => {
              state.set("darkmode", !state.get.darkmode)
            }}
          >
            <i class={state.get.darkmode ? "icon-dark-mode" : "icon-light-mode"} />
          </li>
          <li title="Settings">
            <a href="/settings" onClick={props.linkAction}>
              <i class="icon-settings" />
            </a>
          </li>
          {/* <li title="Profile"> */}
          {/*   <a href="/profile" onClick={props.linkAction}> */}
          {/*     <i class="icon-profile" /> <span>John Doe</span> */}
          {/*   </a> */}
          {/* </li> */}
        </ul>
      </nav>
    </>
  )
}

const Header = () => {
  const [mobileMenu, setMobileMenu] = createSignal(false)

  return (
    <header>
      <div class="logo">
        <h1 hidden>Storytype</h1>
        <a href="/">
          <img src={`/images/logo-${state.get.darkmode ? "dark" : "light"}.svg`} />
        </a>
      </div>
      <Navigation desktop={true} />
      <button class="mobile" onClick={() => setMobileMenu(!mobileMenu())}>
        <i class={mobileMenu() ? "icon-close" : "icon-menu"} title="Menu"></i>
      </button>
      <Show when={mobileMenu()}>
        <div class="mobile-menu">
          <Navigation desktop={false} linkAction={() => setMobileMenu(false)} />
        </div>
      </Show>
    </header>
  )
}

export default Header
