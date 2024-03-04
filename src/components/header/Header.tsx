import "./Header.css"

const Header = () => {
  return (
    <header>
      <div class="logo">
        <h1 hidden>Storytype</h1>
        <a href="/">
          <img src="images/logo-dark.svg" />
        </a>
        <p>Improve your typing skills while reading captivating books</p>
      </div>
      <nav class="menu">
        <ul>
          <li>
            <i class="icon-home" /> <span>Home</span>
          </li>
          <li>
            <i class="icon-books" /> <span>Books</span>
          </li>
          <li>
            <i class="icon-stats" /> <span>Stats</span>
          </li>
        </ul>
      </nav>
      <nav class="profile">
        <ul>
          <li title="Toggle dark mode">
            <i class="icon-dark-mode" />
          </li>
          <li title="Settings">
            <i class="icon-settings" />
          </li>
          <li title="Profile">
            <i class="icon-profile" /> <span>John Doe</span>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
