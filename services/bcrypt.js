const bcrypt = require('bcrypt');
const get = require('lodash.get');

class Bcrypt {
  constructor(config) {
    this.saltRounds = get(config, 'auth.bcrypt.saltRounds', 10);
  }

  hash(plainText) {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  genSalt() {
    return bcrypt.genSaltSync(this.saltRounds);
  }

  // eslint-disable-next-line class-methods-use-this
  compare(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
  }
}

module.exports = Bcrypt;
