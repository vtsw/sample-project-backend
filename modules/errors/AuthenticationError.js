const DomainError = require('./DomainError');

class AuthenticationError extends DomainError {
  constructor(message, info) {
    super(message, 400);
    this.data = { message, code: 400, info };
  }
}

module.exports = AuthenticationError;
