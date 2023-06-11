import mk from "./mk";
import path from "path";
import FileReadError from "src/FileReadError";
import FileReader from "src/FileReader";
import IllegalArgumentError from "src/IllegalArgumentError";

describe("FileReader.read", () => {
  it("resolves files by path", async () => {
    const fileName = "main.js";
    const filePath = path.join("src", fileName);
    const fileContent = 'console.log("Hello, World!")';
    const fs = {
      async stat(path) {
        if (path == filePath) {
          return {
            isFile: () => true,
            isDirectory: () => false,
          };
        }
        throw new Error();
      },
      async readFile(path) {
        if (path === filePath) {
          return fileContent;
        }
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);
    const file = await fileReader.read(filePath);

    expect(file).toEqual(mk(fileName, fileContent));
  });

  it("fails when files and directories are missing", async () => {
    expect.assertions(2);
    const filePath = path.join("src", "main.js");
    const fs = {
      async stat() {
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);

    try {
      await fileReader.read(filePath);
    } catch (error) {
      expect(error).toBeInstanceOf(FileReadError);
      expect(error.message).toBe(`Could not read from ${filePath}`);
    }
  });

  it("fails when path does not point to a file or a directory", async () => {
    expect.assertions(2);
    const filePath = path.join("src", "main.js");
    const fs = {
      async stat(path) {
        if (path == filePath) {
          return {
            isFile: () => false,
            isDirectory: () => false,
          };
        }
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);

    try {
      await fileReader.read(filePath);
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalArgumentError);
      expect(error.message).toBe(
        "Argument to `read` must be a file or directory"
      );
    }
  });

  it("rethows file read error", async () => {
    expect.assertions(2);
    const filePath = path.join("src", "main.js");
    const fs = {
      async stat(path) {
        if (path == filePath) {
          return {
            isFile: () => true,
            isDirectory: () => false,
          };
        }
        throw new Error();
      },
      async readFile() {
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);

    try {
      await fileReader.read(filePath);
    } catch (error) {
      expect(error).toBeInstanceOf(FileReadError);
      expect(error.message).toBe(`Could not read from ${filePath}`);
    }
  });

  it("resolves directories by path", async () => {
    const dirName = "src";
    const dirPath = dirName;
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!")';
    const fs = {
      async stat(path) {
        if (path == dirPath) {
          return {
            isFile: () => false,
            isDirectory: () => true,
          };
        }
        throw new Error();
      },
      async readdir(path) {
        if (path == dirPath) {
          return [
            {
              name: fileName,
              isFile: () => true,
              isDirectory: () => false,
            },
          ];
        }
        throw new Error();
      },
      async readFile(filePath) {
        if (filePath == path.join(dirPath, fileName)) {
          return fileContent;
        }
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);
    const dir = await fileReader.read(dirPath);

    expect(dir).toEqual(mk(dirName, mk(fileName, fileContent)));
  });

  it("resolves nested directories", async () => {
    const fs = {
      async stat(path) {
        if (path == "src") {
          return {
            isFile: () => false,
            isDirectory: () => true,
          };
        }
        throw new Error();
      },
      async readdir(dirPath) {
        if (dirPath == "src") {
          return [
            {
              name: "components",
              isFile: () => false,
              isDirectory: () => true,
            },
          ];
        }
        if (dirPath == path.join("src", "components")) {
          return [
            {
              name: "HelloWorld.js",
              isFile: () => true,
              isDirectory: () => false,
            },
          ];
        }
        throw new Error();
      },
      async readFile(filePath) {
        if (filePath == path.join("src", "components", "HelloWorld.js")) {
          return "export default () => <>Hello, World!</>";
        }
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);
    const dir = await fileReader.read("src");

    expect(dir).toEqual(
      mk(
        "src",
        mk(
          "components",
          mk("HelloWorld.js", "export default () => <>Hello, World!</>")
        )
      )
    );
  });

  it("rethrows directory read error", async () => {
    expect.assertions(2);
    const dirPath = "src";
    const fs = {
      async stat(path) {
        if (path == dirPath) {
          return {
            isFile: () => false,
            isDirectory: () => true,
          };
        }
        throw new Error();
      },
      async readdir() {
        throw new Error();
      },
    };
    const fileReader = new FileReader(fs);

    try {
      await fileReader.read(dirPath);
    } catch (error) {
      expect(error).toBeInstanceOf(FileReadError);
      expect(error.message).toBe(`Could not read from ${dirPath}`);
    }
  });
});
