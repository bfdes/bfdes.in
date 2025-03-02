import { expect, describe, it } from "bun:test";
import Meta from "src/components/Meta";
import JSX from "src/jsx";

const meta = (
  <Meta
    created={new Date("2019-11-12")}
    tags={["Python", "Java"]}
    wordCount={1}
  />
);

describe("Meta", () => {
  it("renders publication date in Gregorian DMY format", () => {
    expect(meta.contains("12 November 2019")).toBeTrue();
  });

  it("links to posts tagged with the same topic", () => {
    const links = meta
      .find((e) => e.name == "a")
      .map((e) => e.attributes.get("href"));

    expect(links).toHaveLength(2);
    expect(links).toContain("/tags/python.html");
    expect(links).toContain("/tags/java.html");
  });
});
