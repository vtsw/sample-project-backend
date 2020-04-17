const DomainError = require('./DomainError');

class ResourceAlreadyExist extends DomainError {
  constructor(resource, query) {
    super(`Resource ${resource} already exist.`, 404);
    this.data = { resource, query };
  }
}

module.exports = ResourceAlreadyExist;
