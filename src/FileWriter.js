import FileWriteError from "./FileWriteError";
import IllegalArgumentError from "./IllegalArgumentError";
import { File, Dir } from "./jsx";
import path from "path";

export default class FileWriter {
  constructor(fs) {
    this.fs = fs;
  }

  async writeFile(rootPath, file) {
    const filePath = path.join(rootPath, file.name);
    try {
      await this.fs.writeFile(filePath, file.content);
    } catch (_) {
      throw new FileWriteError(filePath);
    }
  }

  async writeDir(rootPath, dir) {
    const { name, content } = dir;
    const dirPath = path.join(rootPath, name);
    try {
      // Create the directory if it does not exist
      await this.fs.mkdir(dirPath, { recursive: true });
    } catch (_) {
      throw new FileWriteError(dirPath);
    }
    await Promise.all(content.map((file) => this.write(dirPath, file)));
  }

  async write(rootPath, file) {
    if (file instanceof File) {
      await this.writeFile(rootPath, file);
    } else if (file instanceof Dir) {
      await this.writeDir(rootPath, file);
    } else {
      throw new IllegalArgumentError(
        "Argument to `write` must be a file or directory"
      );
    }
  }
}
