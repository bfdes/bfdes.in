export default class FileWriteError extends Error {
  constructor(filePath) {
    super(`Could not write to ${filePath}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
