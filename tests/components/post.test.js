import { Post } from "src/components";
import JSX from "src/jsx";

describe("Post", () => {
  it("links to the previous post", () => {
    const previous = "my-second-post";
    const post = (
      <Post
        title="My third post"
        body="Lorem ipsum delorum sit amet"
        created={new Date("2022-02-24")}
        tags={["Python"]}
        wordCount={28}
        previous={previous}
      />
    );

    const links = post
      .find((e) => e.name == "a")
      .map((e) => e.attributes.get("href"));

    expect(links).toContain(`/posts/${previous}.html`);
  });

  it("links to the next post", () => {
    const next = "my-second-post";
    const post = (
      <Post
        title="My first post"
        body="Lorem ipsum delorum sit amet"
        created={new Date("2020-03-23")}
        tags={["Python", "Java"]}
        wordCount={28}
        next={next}
      />
    );

    const links = post
      .find((e) => e.name == "a")
      .map((e) => e.attributes.get("href"));

    expect(links).toContain(`/posts/${next}.html`);
  });
});
