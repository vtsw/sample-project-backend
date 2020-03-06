const DomainError = require('./DomainError');

class ResourceNotFoundError extends DomainError {
  constructor(resource, query) {
    super(`Resource ${resource} was not found.`, 404);
    this.data = { resource, query };
  }
}

module.exports = ResourceNotFoundError;
