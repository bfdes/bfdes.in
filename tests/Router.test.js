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
    expect(router.contains("site")).toBeTruthy();

    expect(router.contains("about.html")).toBeTruthy();
    expect(router.contains("404.html")).toBeTruthy();

    expect(router.contains("index.html")).toBeTruthy();
    expect(router.contains("posts")).toBeTruthy();

    expect(router.contains("images")).toBeTruthy();
    expect(router.contains("avatar.webp")).toBeTruthy();

    expect(router.contains("styles")).toBeTruthy();
    expect(router.contains("main.css")).toBeTruthy();

    expect(router.contains("feed.rss")).toBeTruthy();
    expect(router.contains("feed.xml")).toBeTruthy();
    expect(router.contains("rss.xml")).toBeTruthy();
  });

  it("creates all posts", () => {
    expect(router.contains("my-first-post.html")).toBeTruthy();
    expect(router.contains("my-second-post.html")).toBeTruthy();
  });

  it("creates blog indices", () => {
    expect(router.contains("tags")).toBeTruthy();
    expect(router.contains("python.html")).toBeTruthy();
    expect(router.contains("java.html")).toBeTruthy();
  });
});
