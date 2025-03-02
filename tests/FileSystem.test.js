import mk from "./mk";
import { expect, describe, it } from "bun:test";

describe("FileSystem.contains", () => {
  it("matches against file name", () => {
    const name = "main.js";
    const content = 'console.log("Hello, World!");';

    const file = mk(name, content);

    expect(file.contains(name)).toBeTrue();
    expect(file.contains("index.html")).toBeFalse();
  });

  it("matches against directory name", () => {
    const name = "src";
    const emptyDir = mk(name);

    expect(emptyDir.contains(name)).toBeTrue();
    expect(emptyDir.contains("dist")).toBeFalse();
  });

  it("recusively checks non-empty directories", () => {
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!");';

    const dir = mk(dirName, mk(fileName, fileContent));

    expect(dir.contains(fileName)).toBeTrue();
  });
});
