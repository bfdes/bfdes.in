import { expect, describe, it } from "bun:test";
import { RSS } from "src/components";
import JSX from "src/jsx";

const posts = [
  {
    title: "My first post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-first-post",
    created: new Date("2019-11-12"),
    tags: ["Python", "Java"],
    wordCount: 1,
  },
  {
    title: "My second post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-second-post",
    created: new Date("2020-03-23"),
    tags: ["Java"],
    wordCount: 2,
  },
];

describe("RSS", () => {
  it("links every post", () => {
    const feed = <RSS>{posts}</RSS>;
    const links = feed
      .find((e) => e.name == "link")
      .map((e) => e.children)
      .flat();

    expect(links).toContain("https://bfdes.in/posts/my-first-post.html");
    expect(links).toContain("https://bfdes.in/posts/my-second-post.html");
  });
});
