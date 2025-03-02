import { expect, describe, it } from "bun:test";
import Sidebar from "src/components/Sidebar";
import JSX from "src/jsx";

describe("Sidebar", () => {
  it("renders links", () => {
    const sidebar = <Sidebar />;
    const links = sidebar
      .find((e) => e.name == "a")
      .map((e) => e.attributes.get("href"));

    expect(links).toHaveLength(4);
    expect(links).toContain("/posts");
    expect(links).toContain("/about.html");
    expect(links).toContain("https://github.com/bfdes");
    expect(links).toContain("/feed.rss");
  });
});
