import Router from "src/Router";

expect.extend({
  toContain(router, fileName) {
    const pass = router.contains(fileName);
    const msg = pass
      ? `expected router not to contain ${fileName}`
      : `expected router to contain ${fileName}`;
    return {
      pass,
      message: () => msg,
    };
  },
});

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
    expect(router).toContain("site");

    expect(router).toContain("about.html");
    expect(router).toContain("404.html");

    expect(router).toContain("index.html");
    expect(router).toContain("posts");

    expect(router).toContain("images");
    expect(router).toContain("avatar.webp");

    expect(router).toContain("styles");
    expect(router).toContain("main.css");

    expect(router).toContain("feed.rss");
    expect(router).toContain("feed.xml");
    expect(router).toContain("rss.xml");
  });

  it("creates all posts", () => {
    expect(router).toContain("my-first-post.html");
    expect(router).toContain("my-second-post.html");
  });

  it("creates blog indices", () => {
    expect(router).toContain("tags");
    expect(router).toContain("python.html");
    expect(router).toContain("java.html");
  });
});
