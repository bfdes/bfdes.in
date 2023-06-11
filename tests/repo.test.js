import Repo from "src/Repo";

expect.extend({
  toBeSorted(arr, cmp) {
    let pass = true;
    for (let i = 0; i < arr.length - 1; i++) {
      if (cmp(arr[i], arr[i + 1]) > 0) {
        pass = false;
        break;
      }
    }

    const msg = pass
      ? `expected ${JSON.stringify(arr, null, 2)} not to be sorted`
      : `expected ${JSON.stringify(arr, null, 2)} to be sorted`;

    return {
      pass,
      message: () => msg,
    };
  },
});

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
  {
    title: "My third post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-third-post",
    created: new Date("2022-02-24"),
    tags: ["Python"],
    wordCount: 3,
  },
];

const repo = new Repo(posts);

describe("Repo", () => {
  describe("posts", () => {
    it("returns all posts", () => {
      expect(repo.posts.length).toBe(posts.length);
    });

    it("returns posts in reverse chronological order", () => {
      const cmp = (p, q) => q.created - p.created;
      expect(repo.posts).toBeSorted(cmp);
    });

    it("returns paged posts", () => {
      const [third, second, first] = repo.posts;

      expect(third.next).toBeUndefined();
      expect(third.previous).toBe(second.slug);

      expect(second.next).toBe(third.slug);
      expect(second.previous).toBe(first.slug);

      expect(first.next).toBe(second.slug);
      expect(first.previous).toBeUndefined();
    });
  });

  describe("tags", () => {
    it("returns all tags", () => {
      const tags = new Set(posts.flatMap((p) => p.tags));
      expect(repo.tags).toEqual(tags);
    });
  });
});
