import "./Header.css"
import state from "../../../state/state"

const Header = () => {
  return (
    <header>
      <div class="logo">
        <h1 hidden>Storytype</h1>
        <a href="/">
          <img src={`images/logo-${state.get.darkmode ? "dark" : "light"}.svg`} />
        </a>
      </div>
      <nav class="menu desktop">
        <ul>
          <li>
            <a href="/">
              <i class="icon-home" /> <span>Home</span>
            </a>
          </li>
          <li>
            <a href="/books">
              <i class="icon-books" /> <span>Books</span>
            </a>
          </li>
          <li>
            <a href="/stats">
              <i class="icon-stats" /> <span>Stats</span>
            </a>
          </li>
        </ul>
      </nav>
      <nav class="profile desktop">
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
            <a href="/settings">
              <i class="icon-settings" />
            </a>
          </li>
          {/* <li title="Profile"> */}
          {/*   <a href="/profile"> */}
          {/*     <i class="icon-profile" /> <span>John Doe</span> */}
          {/*   </a> */}
          {/* </li> */}
        </ul>
      </nav>
    </header>
  )
}

export default Header
