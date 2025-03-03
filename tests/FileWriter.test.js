import mk from "./mk";
import { jest } from "@jest/globals";
import path from "path";
import FileWriteError from "src/FileWriteError";
import FileWriter from "src/FileWriter";
import IllegalArgumentError from "src/IllegalArgumentError";

describe("FileWriter.write", () => {
  const rootPath = ".";

  it("writes files", async () => {
    const name = "main.js";
    const content = 'console.log("Hello, World!")';
    const fs = {
      writeFile: jest.fn(),
    };
    const fileWriter = new FileWriter(fs);
    const file = mk(name, content);
    await fileWriter.write(rootPath, file);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(rootPath, name),
      content,
    );
  });

  it("rejects unsupported resources", async () => {
    expect.assertions(2);
    const fileWriter = new FileWriter({});

    try {
      await fileWriter.write(rootPath, {});
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalArgumentError);
      expect(error.message).toBe(
        "Argument to `write` must be a file or directory",
      );
    }
  });

  it("writes directories", async () => {
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!")';
    const fs = {
      mkdir: jest.fn(),
      writeFile: jest.fn(),
    };
    const fileWriter = new FileWriter(fs);
    const dir = mk(dirName, mk(fileName, fileContent));
    await fileWriter.write(rootPath, dir);

    expect(fs.mkdir).toHaveBeenCalledTimes(1);
    expect(fs.mkdir).toHaveBeenCalledWith(path.join(rootPath, dirName), {
      recursive: true,
    });
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(rootPath, dirName, fileName),
      fileContent,
    );
  });

  it("fails when directories cannot be written", async () => {
    expect.assertions(2);
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!")';
    const fs = {
      async mkdir() {
        throw new Error();
      },
    };
    const fileWriter = new FileWriter(fs);
    const dir = mk(dirName, mk(fileName, fileContent));

    try {
      await fileWriter.write(rootPath, dir);
    } catch (error) {
      expect(error).toBeInstanceOf(FileWriteError);
      expect(error.message).toBe(
        `Could not write to ${path.join(rootPath, dirName)}`,
      );
    }
  });

  it("fails when files cannot be written", async () => {
    expect.assertions(2);
    const dirName = "src";
    const fileName = "main.js";
    const fileContent = 'console.log("Hello, World!")';
    const fs = {
      mkdir: jest.fn(),
      async writeFile() {
        throw new Error();
      },
    };
    const fileWriter = new FileWriter(fs);
    const dir = mk(dirName, mk(fileName, fileContent));

    try {
      await fileWriter.write(rootPath, dir);
    } catch (error) {
      expect(error).toBeInstanceOf(FileWriteError);
      expect(error.message).toBe(
        `Could not write to ${path.join(rootPath, dirName, fileName)}`,
      );
    }
  });
});
