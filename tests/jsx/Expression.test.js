import { expect, describe, it } from "bun:test";
import JSX from "src/jsx";

describe("Expression.find", () => {
  it("returns all matching expressions", () => {
    const element = (
      <ul>
        <li>Python</li>
        <li>Java</li>
      </ul>
    );

    const languages = element
      .find((e) => e.name == "li")
      .map((e) => e.children)
      .flat();

    expect(languages).toHaveLength(2);
    expect(languages).toContain("Python");
    expect(languages).toContain("Java");
  });
});
