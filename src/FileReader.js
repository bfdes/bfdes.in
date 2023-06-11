import FileReadError from "./FileReadError";
import IllegalArgumentError from "./IllegalArgumentError";
import { File, Dir } from "./jsx";
import path from "path";

export default class FileReader {
  constructor(fs) {
    this.fs = fs;
  }

  async readFile(filePath) {
    try {
      const content = await this.fs.readFile(filePath);
      const name = path.basename(filePath);
      return new File(name, content);
    } catch (_) {
      throw new FileReadError(filePath);
    }
  }

  async readDir(dirPath) {
    let entries;
    try {
      entries = await this.fs.readdir(dirPath, {
        withFileTypes: true,
      });
    } catch (_) {
      throw new FileReadError(dirPath);
    }

    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() || entry.isDirectory())
        .map((entry) =>
          entry.isFile()
            ? this.readFile(path.join(dirPath, entry.name))
            : this.readDir(path.join(dirPath, entry.name))
        )
    );
    const name = path.basename(dirPath);
    return new Dir(name, files);
  }

  async read(path) {
    let stats;
    try {
      stats = await this.fs.stat(path);
    } catch (_) {
      throw new FileReadError(path);
    }

    if (stats.isFile()) {
      return await this.readFile(path);
    }
    if (stats.isDirectory()) {
      return await this.readDir(path);
    }
    throw new IllegalArgumentError(
      "Argument to `read` must be a file or directory"
    );
  }
}
