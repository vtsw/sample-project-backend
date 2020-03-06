const DomainError = require('./DomainError');

class AuthenticationError extends DomainError {
  constructor(message) {
    super(message, 400);
    this.data = { message, code: 400 };
  }
}

module.exports = AuthenticationError;
