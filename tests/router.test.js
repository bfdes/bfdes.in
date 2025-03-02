import { expect, describe, it } from "bun:test";
import Router from "src/Router";

const router = Router([
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
]);

describe("Router", () => {
  it("creates blog", () => {
    expect(router.contains("site")).toBeTrue();

    expect(router.contains("about.html")).toBeTrue();
    expect(router.contains("404.html")).toBeTrue();

    expect(router.contains("index.html")).toBeTrue();
    expect(router.contains("posts")).toBeTrue();

    expect(router.contains("images")).toBeTrue();
    expect(router.contains("avatar.webp")).toBeTrue();

    expect(router.contains("styles")).toBeTrue();
    expect(router.contains("main.css")).toBeTrue();

    expect(router.contains("feed.rss")).toBeTrue();
    expect(router.contains("feed.xml")).toBeTrue();
    expect(router.contains("rss.xml")).toBeTrue();
  });

  it("creates all posts", () => {
    expect(router.contains("my-first-post.html")).toBeTrue();
    expect(router.contains("my-second-post.html")).toBeTrue();
  });

  it("creates blog indices", () => {
    expect(router.contains("tags")).toBeTrue();
    expect(router.contains("python.html")).toBeTrue();
    expect(router.contains("java.html")).toBeTrue();
  });
});
