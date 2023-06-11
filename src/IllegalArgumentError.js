// https://github.com/istanbuljs/v8-to-istanbul/issues/198

export default class IllegalArgumentError extends Error {
  constructor(msg, ...args) {
    super(msg, ...args);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
