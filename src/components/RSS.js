import JSX from "../jsx";

export default ({ children }) => (
  <rss version="1.0">
    <channel>
      <title>bfdes.in</title>
      <link>https://bfdes.in</link>
      <description>Programming and Technology blog</description>
      <items>
        {children.map(({ title, summary, created, slug }) => {
          const link = `https://bfdes.in/posts/${slug}.html`;
          return (
            <item>
              <title>{title}</title>
              <author>Bruno Fernandes</author>
              <description>{summary}</description>
              <link>{link}</link>
              <guid>{link}</guid>
              <pubDate>{created.toUTCString()}</pubDate>
            </item>
          );
        })}
      </items>
    </channel>
  </rss>
);
