import mk from "./mk";
import { parse } from "src/md";
import {
  FrontmatterParseError,
  MissingFrontmatterError,
  MissingMetadataKeysError,
  InvalidMetadataKeysError,
} from "src/meta";

describe("md.parse", () => {
  it("extracts metadata from frontmatter", async () => {
    const markup = [
      "---",
      "title: Complex numbers",
      "tags: [Python]",
      "created: 1991-02-20",
      "summary: Representing complex numbers in Python",
      "---",
    ].join("\n");

    const file = mk("complex-numbers.md", Buffer.from(markup));
    const post = await parse(file);

    expect(post.title).toBe("Complex numbers");
    expect(post.tags).toEqual(["Python"]);
    expect(post.created).toEqual(new Date("1991-02-20"));
    expect(post.summary).toBe("Representing complex numbers in Python");
  });

  it("extracts article", async () => {
    const markup = [
      "---",
      "title: Complex numbers",
      "tags: [Python]",
      "created: 1991-02-20",
      "summary: Representing complex numbers in Python",
      "---",
      "# Complex numbers",
      "Python supports complex numbers natively. For example, $1 + 2*j$ is written as",
      "```python",
      "1 + 2j",
      "```",
    ].join("\n");

    const file = mk("complex-numbers.md", Buffer.from(markup));
    const post = await parse(file);

    expect(post.body).toBeDefined();
  });

  it("computes article word count", async () => {
    const markup = [
      "---",
      "title: Complex numbers",
      "tags: [Python]",
      "created: 1991-02-20",
      "summary: Representing complex numbers in Python",
      "---",
      "# Complex numbers",
      "Python supports complex numbers natively. For example, $1 + 2*j$ is written as",
      "```python",
      "1 + 2j",
      "```",
    ].join("\n");

    const file = mk("complex-numbers.md", Buffer.from(markup));
    const post = await parse(file);

    expect(post.wordCount).toBe(12);
  });

  it("fails when frontmatter is missing", async () => {
    expect.assertions(1);

    const markup = [
      "# Complex numbers",
      "Python supports complex numbers natively. For example, $1 + 2*j$ is written as",
      "```python",
      "1 + 2j",
      "```",
    ].join("\n");

    const file = mk("complex-numbers.md", Buffer.from(markup));

    try {
      await parse(file);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingFrontmatterError);
    }
  });

  it("fails when file is empty", async () => {
    expect.assertions(1);
    const file = mk("complex-numbers.md", Buffer.from(""));

    try {
      await parse(file);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingFrontmatterError);
    }
  });

  it("fails when frontmatter is empty", async () => {
    expect.assertions(1);
    const markup = ["---", "---"].join("\n");
    const file = mk("complex-numbers.md", Buffer.from(markup));

    try {
      await parse(file);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingFrontmatterError);
    }
  });

  it("fails when frontmatter cannot be parsed as YAML", async () => {
    expect.assertions(1);

    const markup = [
      "---",
      `title = "Complex numbers"`,
      `tags = ["Python"]`,
      `created = 1991-02-20`,
      `summary = "Representing complex numbers in Python"`,
      "---",
    ].join("\n"); // n.b. this is TOML

    const file = mk("complex-numbers.md", Buffer.from(markup));

    try {
      await parse(file);
    } catch (error) {
      expect(error).toBeInstanceOf(FrontmatterParseError);
    }
  });

  it("fails when metadata is missing keys", async () => {
    expect.assertions(1);
    const markup = [
      "---",
      "title: Complex numbers",
      "tags: [Python]",
      "created: 1991-02-20",
      "---",
    ].join("\n");

    const file = mk("complex-numbers.md", Buffer.from(markup));

    try {
      await parse(file);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingMetadataKeysError);
    }
  });

  it("fails when metadata is invalid", async () => {
    expect.assertions(1);

    const markup = [
      "---",
      "title: Complex numbers",
      "tags: [Python]",
      "created: 667008000",
      "summary: Representing complex numbers in Python",
      "---",
    ].join("\n");

    const file = mk("complex-numbers.md", Buffer.from(markup));

    try {
      await parse(file);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidMetadataKeysError);
    }
  });
});
