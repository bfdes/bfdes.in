import JSX from "../jsx";
import Meta from "./Meta";
import Page from "./Page";

export default ({ children }) => (
  <Page>
    <div class="posts">
      <h1>Blog</h1>
      <ul id="posts">
        {children.map(({ title, slug, created, tags, wordCount }) => (
          <li class="post">
            <a class="nav-item" href={`/posts/${slug}.html`}>
              <h2>{title}</h2>
            </a>
            <Meta created={created} tags={tags} wordCount={wordCount} />
          </li>
        ))}
      </ul>
    </div>
  </Page>
);
