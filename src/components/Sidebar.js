import JSX from "../jsx";

const Profile = () => (
  <img
    class="avatar"
    src="/images/avatar.webp"
    width="380"
    height="380"
    alt="Profile photo"
  />
);

const NavBar = () => (
  <div id="nav">
    <a class="nav-item" href="/posts">
      <h2>Blog</h2>
    </a>
    <a class="nav-item" href="/about.html">
      <h2>About</h2>
    </a>
  </div>
);

const Social = () => (
  <div id="social">
    <a class="nav-item" href="https://github.com/bfdes">
      <img
        class="badge"
        src="/images/github.png"
        width="40"
        height="40"
        alt="GitHub link"
      />
    </a>
    <a class="nav-item" href="/feed.rss">
      <img
        class="badge"
        src="/images/rss.png"
        width="40"
        height="40"
        alt="RSS link"
      />
    </a>
  </div>
);

export default () => (
  <aside id="sidebar">
    <Profile />
    <NavBar />
    <Social />
  </aside>
);
