import mk from "./mk";

describe("FileSystem.contains", () => {
  it("matches against file name", () => {
    const name = "main.js";
    const content = 'console.log("Hello, World!");';

    const file = mk(name, content);

    expect(file.contains(name)).toBeTruthy();
    expect(file.contains("index.html")).toBeFalsy();
  });

  it("matches against directory name", () => {
    const name = "src";
    const emptyDir = mk(name);

    expect(emptyDir.contains(name)).toBeTruthy();
    expect(emptyDir.contains("dist")).toBeFalsy();
  });

  it("recusively checks non-empty directories", () => {
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!");';

    const dir = mk(dirName, mk(fileName, fileContent));

    expect(dir.contains(fileName)).toBeTruthy();
  });
});
