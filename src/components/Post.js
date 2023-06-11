import JSX from "../jsx";
import Meta from "./Meta";
import Page from "./Page";

export default ({ title, body, created, tags, wordCount, previous, next }) => (
  <Page>
    <div class="post">
      <h1>{title}</h1>
      <Meta created={created} tags={tags} wordCount={wordCount} />
      <div class="body">{body}</div>
    </div>
    <div class="pagination">
      <span class="pagination-item">
        {previous ? (
          <a href={`/posts/${previous}.html`}>Previous</a>
        ) : (
          "Previous"
        )}
      </span>
      <span class="pagination-item">
        {next ? <a href={`/posts/${next}.html`}>Next</a> : "Next"}
      </span>
    </div>
  </Page>
);
