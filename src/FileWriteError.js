// https://github.com/istanbuljs/v8-to-istanbul/issues/198

export default class FileWriteError extends Error {
  constructor(filePath) {
    super(`Could not write to ${filePath}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
