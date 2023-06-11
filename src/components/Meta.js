import JSX from "../jsx";
import slugify from "../slugify";

const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });

export default ({ created, tags, wordCount }) => (
  <p class="meta">
    {dateFormatter.format(created)}
    {" · "}
    <span>
      {tags
        .map((tag) => <a href={`/tags/${slugify(tag)}.html`}>{tag}</a>)
        .reduce((links, link) => [...links, " # ", link], [])}
    </span>
    {" · "}
    {wordCount == 1 ? "1 word" : `${wordCount} words`}
  </p>
);
