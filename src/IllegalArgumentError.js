export default class IllegalArgumentError extends Error {
  constructor(msg, ...args) {
    super(msg, ...args);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
