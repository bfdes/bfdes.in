// https://github.com/istanbuljs/v8-to-istanbul/issues/198

export default class FileReadError extends Error {
  constructor(filePath) {
    super(`Could not read from ${filePath}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
