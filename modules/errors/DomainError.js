class DomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.data = {
      message, code,
    };
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = DomainError;
