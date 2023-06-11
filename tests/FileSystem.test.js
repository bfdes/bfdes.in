import mk from "./mk";

describe("FileSystem.contains", () => {
  it("matches against file name", () => {
    const name = "main.js";
    const content = 'console.log("Hello, World!");';

    const file = mk(name, content);

    expect(file.contains(name)).toBe(true);
    expect(file.contains("index.html")).toBe(false);
  });

  it("matches against directory name", () => {
    const name = "src";
    const emptyDir = mk(name);

    expect(emptyDir.contains(name)).toBe(true);
    expect(emptyDir.contains("dist")).toBe(false);
  });

  it("recusively checks non-empty directories", () => {
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!");';

    const dir = mk(dirName, mk(fileName, fileContent));

    expect(dir.contains(fileName)).toBe(true);
  });
});
