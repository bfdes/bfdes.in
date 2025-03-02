import { expect, describe, it } from "bun:test";
import { Posts } from "src/components";
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

describe("Posts", () => {
  it("renders blog index", () => {
    const element = <Posts>{posts}</Posts>;
    const items = element.find((e) => e.name == "li");

    expect(items).toHaveLength(posts.length);
  });
});
