const DomainError = require('./DomainError');

class ZaloApiError extends DomainError {
  constructor(code, message) {
    super(message);
    this.data = { message, code };
  }
}

module.exports = ZaloApiError;
